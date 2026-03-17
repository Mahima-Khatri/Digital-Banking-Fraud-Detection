from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import List

app = FastAPI(title="PaySim Fraud Detection API", version="2.0")

# Resolve model paths
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

# Load trained model and features
model = joblib.load(MODELS_DIR / "fraud_probability_model.pkl")
features = joblib.load(MODELS_DIR / "model_features.pkl")


class TransactionRequest(BaseModel):
    """PaySim Mobile Money Transaction Request"""
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    type: str = Field(..., description="Transaction type: PAYMENT, TRANSFER, CASH_OUT, DEBIT, CASH_IN")
    amount: float = Field(..., gt=0, description="Transaction amount")
    oldbalanceOrg: float = Field(..., ge=0, description="Sender's balance before transaction")
    newbalanceOrig: float = Field(..., ge=0, description="Sender's balance after transaction")
    oldbalanceDest: float = Field(..., ge=0, description="Receiver's balance before transaction")
    newbalanceDest: float = Field(..., ge=0, description="Receiver's balance after transaction")

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        allowed_types = {"PAYMENT", "TRANSFER", "CASH_OUT", "DEBIT", "CASH_IN"}
        value_upper = value.upper()
        if value_upper not in allowed_types:
            raise ValueError(f"type must be one of: {', '.join(allowed_types)}")
        return value_upper


class FraudReason(BaseModel):
    """Individual fraud reason"""
    reason: str
    severity: str  # HIGH, MEDIUM, LOW


class FraudPredictionResponse(BaseModel):
    """Fraud prediction response with score and reasons"""
    fraud_score: float = Field(..., description="Fraud probability (0-1)")
    fraud_percentage: float = Field(..., description="Fraud probability as percentage")
    is_fraud: bool = Field(..., description="Whether transaction is classified as fraud")
    risk_level: str = Field(..., description="Risk level: LOW, MEDIUM, HIGH, CRITICAL")
    reasons: List[FraudReason] = Field(..., description="List of fraud indicators")
    recommendation: str = Field(..., description="Action recommendation")


def analyze_fraud_reasons(transaction_data: dict, fraud_score: float) -> List[FraudReason]:
    """Analyze transaction and generate fraud reasons"""
    reasons = []
    
    amount = transaction_data['amount']
    old_bal_orig = transaction_data['oldbalanceOrg']
    new_bal_orig = transaction_data['newbalanceOrig']
    old_bal_dest = transaction_data['oldbalanceDest']
    new_bal_dest = transaction_data['newbalanceDest']
    trans_type = transaction_data['type']
    
    # Calculate balance differences
    balance_diff_orig = old_bal_orig - new_bal_orig - amount
    balance_diff_dest = new_bal_dest - old_bal_dest - amount
    
    # Reason 1: High transaction amount
    if amount > 200000:
        reasons.append(FraudReason(
            reason=f"Very high transaction amount: ${amount:,.2f}",
            severity="HIGH"
        ))
    elif amount > 100000:
        reasons.append(FraudReason(
            reason=f"High transaction amount: ${amount:,.2f}",
            severity="MEDIUM"
        ))
    
    # Reason 2: Balance inconsistency (sender)
    if abs(balance_diff_orig) > 0.01:
        reasons.append(FraudReason(
            reason=f"Sender balance inconsistency detected (diff: ${abs(balance_diff_orig):,.2f})",
            severity="HIGH"
        ))
    
    # Reason 3: Balance inconsistency (receiver)
    if abs(balance_diff_dest) > 0.01:
        reasons.append(FraudReason(
            reason=f"Receiver balance inconsistency detected (diff: ${abs(balance_diff_dest):,.2f})",
            severity="HIGH"
        ))
    
    # Reason 4: Zero balance after transaction
    if new_bal_orig == 0 and old_bal_orig > 0:
        reasons.append(FraudReason(
            reason="Sender account emptied completely",
            severity="HIGH"
        ))
    
    # Reason 5: Receiver had zero balance
    if old_bal_dest == 0 and new_bal_dest > 0:
        reasons.append(FraudReason(
            reason="Receiver account was empty (potential mule account)",
            severity="MEDIUM"
        ))
    
    # Reason 6: Transaction type risk
    if trans_type in ['TRANSFER', 'CASH_OUT']:
        reasons.append(FraudReason(
            reason=f"High-risk transaction type: {trans_type}",
            severity="MEDIUM"
        ))
    
    # Reason 7: Amount exceeds sender balance
    if amount > old_bal_orig:
        reasons.append(FraudReason(
            reason=f"Transaction amount (${amount:,.2f}) exceeds sender balance (${old_bal_orig:,.2f})",
            severity="CRITICAL"
        ))
    
    # Reason 8: Unusual amount patterns
    if amount % 10000 == 0 and amount >= 50000:
        reasons.append(FraudReason(
            reason=f"Round amount transaction: ${amount:,.2f} (potential money laundering)",
            severity="MEDIUM"
        ))
    
    # Reason 9: High fraud score from ML model
    if fraud_score > 0.8:
        reasons.append(FraudReason(
            reason=f"ML model detected high fraud probability: {fraud_score*100:.1f}%",
            severity="CRITICAL"
        ))
    elif fraud_score > 0.5:
        reasons.append(FraudReason(
            reason=f"ML model detected elevated fraud risk: {fraud_score*100:.1f}%",
            severity="HIGH"
        ))
    
    # If no specific reasons but fraud score is high
    if len(reasons) == 0 and fraud_score > 0.3:
        reasons.append(FraudReason(
            reason="Transaction pattern matches known fraud signatures",
            severity="MEDIUM"
        ))
    
    return reasons


@app.get("/")
def home():
    return {
        "message": "PaySim Fraud Detection API",
        "version": "2.0",
        "model": "Random Forest / XGBoost",
        "status": "Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "features_count": len(features)
    }


@app.post("/predict", response_model=FraudPredictionResponse)
def predict_fraud(payload: TransactionRequest):
    """
    Predict fraud probability for a transaction
    
    Returns fraud score (0-1), risk level, and detailed reasons
    """
    try:
        # Create transaction dictionary
        transaction = {
            'step': 1,  # Default to 1 for real-time transactions
            'amount': payload.amount,
            'oldbalanceOrg': payload.oldbalanceOrg,
            'newbalanceOrig': payload.newbalanceOrig,
            'oldbalanceDest': payload.oldbalanceDest,
            'newbalanceDest': payload.newbalanceDest,
        }
        
        # Feature engineering (same as training)
        transaction['balance_diff_orig'] = (
            payload.oldbalanceOrg - payload.newbalanceOrig - payload.amount
        )
        transaction['balance_diff_dest'] = (
            payload.newbalanceDest - payload.oldbalanceDest - payload.amount
        )
        transaction['is_zero_balance_orig'] = int(payload.newbalanceOrig == 0)
        transaction['is_zero_balance_dest'] = int(payload.oldbalanceDest == 0)
        
        # One-hot encode transaction type
        for trans_type in ['CASH_IN', 'CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER']:
            transaction[f'type_{trans_type}'] = int(payload.type == trans_type)
        
        # Convert to DataFrame
        df = pd.DataFrame([transaction])
        
        # Align with training features
        df = df.reindex(columns=features, fill_value=0)
        
        # Predict fraud probability
        fraud_score = float(model.predict_proba(df)[:,1][0])
        fraud_percentage = fraud_score * 100
        
        # Determine risk level
        if fraud_score >= 0.8:
            risk_level = "CRITICAL"
            is_fraud = True
            recommendation = "BLOCK transaction immediately and flag account for investigation"
        elif fraud_score >= 0.5:
            risk_level = "HIGH"
            is_fraud = True
            recommendation = "HOLD transaction for manual review"
        elif fraud_score >= 0.3:
            risk_level = "MEDIUM"
            is_fraud = False
            recommendation = "ALLOW with enhanced monitoring"
        else:
            risk_level = "LOW"
            is_fraud = False
            recommendation = "ALLOW transaction"
        
        # Generate fraud reasons
        transaction_data = {
            'amount': payload.amount,
            'oldbalanceOrg': payload.oldbalanceOrg,
            'newbalanceOrig': payload.newbalanceOrig,
            'oldbalanceDest': payload.oldbalanceDest,
            'newbalanceDest': payload.newbalanceDest,
            'type': payload.type
        }
        reasons = analyze_fraud_reasons(transaction_data, fraud_score)
        
        return FraudPredictionResponse(
            fraud_score=fraud_score,
            fraud_percentage=fraud_percentage,
            is_fraud=is_fraud,
            risk_level=risk_level,
            reasons=reasons,
            recommendation=recommendation
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")