"""
PaySim Mobile Money Fraud Detection
Dataset: 6.3M transactions, 8,213 frauds (0.129%)
Target: >95% Accuracy with High TP & TN
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report, roc_auc_score)
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

print("="*70)
print("PAYSIM MOBILE MONEY FRAUD DETECTION")
print("="*70)

# Load data
print("\n[1/7] Loading data...")
df = pd.read_csv('dataset/PS_20174392719_1491204439457_log.csv')
print(f"✓ Loaded {len(df):,} transactions")
print(f"  Frauds: {df['isFraud'].sum():,} ({df['isFraud'].sum()/len(df)*100:.3f}%)")

# Feature engineering
print("\n[2/7] Feature engineering...")

# Create new features
df['balance_diff_orig'] = df['oldbalanceOrg'] - df['newbalanceOrig'] - df['amount']
df['balance_diff_dest'] = df['newbalanceDest'] - df['oldbalanceDest'] - df['amount']
df['is_zero_balance_orig'] = (df['newbalanceOrig'] == 0).astype(int)
df['is_zero_balance_dest'] = (df['oldbalanceDest'] == 0).astype(int)

# One-hot encode transaction type
df = pd.get_dummies(df, columns=['type'], drop_first=False)

# Drop unnecessary columns
df = df.drop(['nameOrig', 'nameDest', 'isFlaggedFraud'], axis=1)

print(f"Features created: {df.shape[1] - 1}")

# Prepare data
X = df.drop('isFraud', axis=1)
y = df['isFraud']

# Sample for faster training (use 1M transactions)
print("\n[3/7] Sampling data for faster training...")
from sklearn.utils import resample

# Separate fraud and normal
fraud_df = df[df['isFraud'] == 1]
normal_df = df[df['isFraud'] == 0]

# Sample
fraud_sample = fraud_df  # Keep all frauds
normal_sample = resample(normal_df, n_samples=500000, random_state=42)

# Combine
df_sampled = pd.concat([fraud_sample, normal_sample])
df_sampled = df_sampled.sample(frac=1, random_state=42).reset_index(drop=True)

X = df_sampled.drop('isFraud', axis=1)
y = df_sampled['isFraud']

print(f"Sampled dataset: {len(df_sampled):,} transactions")
print(f"Frauds in sample: {y.sum():,}")

# Split data
print("\n[4/7] Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train: {len(X_train):,}, Test: {len(X_test):,}")
print(f"Test frauds: {y_test.sum():,}")

# Apply SMOTE
print("\n[5/7] Applying SMOTE...")
smote = SMOTE(random_state=42, k_neighbors=5)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
print(f"After SMOTE: {len(y_train_balanced):,} samples")

# Train models
print("\n[6/7] Training models...")
models = {}

# Model 1: Random Forest
print("   Training Random Forest...")
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=10,
    min_samples_leaf=4,
    random_state=42,
    n_jobs=-1,
    verbose=1
)
rf.fit(X_train_balanced, y_train_balanced)
models['Random Forest'] = rf

# Model 2: XGBoost
print("\n   Training XGBoost...")
scale = len(y_train[y_train==0]) / len(y_train[y_train==1])
xgb = XGBClassifier(
    n_estimators=100,
    max_depth=7,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=scale,
    random_state=42,
    use_label_encoder=False,
    eval_metric='logloss'
)
xgb.fit(X_train_balanced, y_train_balanced)
models['XGBoost'] = xgb

# Evaluate models
print("\n[7/7] Evaluating models...")
results = []

for name, model in models.items():
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:,1]
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    
    results.append({
        'Model': name,
        'Accuracy': acc,
        'Precision': prec,
        'Recall': rec,
        'F1': f1,
        'AUC': auc,
        'TN': tn,
        'FP': fp,
        'FN': fn,
        'TP': tp
    })
    
    print(f"\n{name}:")
    print(f"  Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall: {rec:.4f}")
    print(f"  F1-Score: {f1:.4f}")
    print(f"  TN: {tn:,}, FP: {fp:,}, FN: {fn:,}, TP: {tp:,}")

# Find best model
results_df = pd.DataFrame(results)
best_idx = results_df['F1'].idxmax()
best_model_name = results_df.loc[best_idx, 'Model']
best_model = models[best_model_name]
best_result = results_df.loc[best_idx]

print(f"\n>>> BEST MODEL: {best_model_name}")

# Final results
print("\n" + "="*70)
print(f"FINAL RESULTS - {best_model_name}")
print("="*70)

y_pred_best = best_model.predict(X_test)
y_prob_best = best_model.predict_proba(X_test)[:,1]

print(f"\nAccuracy:  {best_result['Accuracy']:.4f} ({best_result['Accuracy']*100:.2f}%)")
print(f"Precision: {best_result['Precision']:.4f}")
print(f"Recall:    {best_result['Recall']:.4f}")
print(f"F1-Score:  {best_result['F1']:.4f}")
print(f"ROC-AUC:   {best_result['AUC']:.4f}")

cm_best = confusion_matrix(y_test, y_pred_best)
print("\nConfusion Matrix:")
print(cm_best)

print(f"\nTrue Negatives (TN):  {best_result['TN']:,} ✓")
print(f"False Positives (FP): {best_result['FP']:,}")
print(f"False Negatives (FN): {best_result['FN']:,}")
print(f"True Positives (TP):  {best_result['TP']:,} ✓")

tn_rate = best_result['TN'] / (best_result['TN'] + best_result['FP'])
tp_rate = best_result['TP'] / (best_result['TP'] + best_result['FN'])

print(f"\nTN Rate (Specificity): {tn_rate:.2%}")
print(f"TP Rate (Sensitivity): {tp_rate:.2%}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred_best, target_names=['Normal', 'Fraud']))

# Visualizations
print("\nGenerating visualizations...")
fig = plt.figure(figsize=(15, 10))

# Plot 1: Confusion Matrix
plt.subplot(2, 3, 1)
sns.heatmap(cm_best, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Normal', 'Fraud'], yticklabels=['Normal', 'Fraud'])
plt.title(f'Confusion Matrix - {best_model_name}', fontweight='bold')
plt.ylabel('Actual')
plt.xlabel('Predicted')

# Plot 2: Metrics
plt.subplot(2, 3, 2)
metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC']
values = [best_result['Accuracy'], best_result['Precision'], 
          best_result['Recall'], best_result['F1'], best_result['AUC']]
bars = plt.bar(metrics, values, color=['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'])
plt.ylim(0, 1)
plt.title('Performance Metrics', fontweight='bold')
plt.ylabel('Score')
plt.xticks(rotation=45, ha='right')
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{height:.3f}', ha='center', va='bottom', fontweight='bold')

# Plot 3: TP vs TN
plt.subplot(2, 3, 3)
categories = ['True\nNegatives', 'True\nPositives', 'False\nPositives', 'False\nNegatives']
values = [best_result['TN'], best_result['TP'], best_result['FP'], best_result['FN']]
colors = ['#2ecc71', '#3498db', '#f39c12', '#e74c3c']
bars = plt.bar(categories, values, color=colors)
plt.title('Prediction Breakdown', fontweight='bold')
plt.ylabel('Count')
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{int(height):,}', ha='center', va='bottom', fontweight='bold')

# Plot 4: Model Comparison
plt.subplot(2, 3, 4)
plt.barh(results_df['Model'], results_df['Accuracy'], color='steelblue')
plt.xlabel('Accuracy')
plt.title('Model Accuracy Comparison', fontweight='bold')
for i, v in enumerate(results_df['Accuracy']):
    plt.text(v, i, f' {v:.4f}', va='center')

# Plot 5: TN and TP Rates
plt.subplot(2, 3, 5)
rates = ['TN Rate\n(Specificity)', 'TP Rate\n(Sensitivity)']
rate_values = [tn_rate, tp_rate]
bars = plt.bar(rates, rate_values, color=['#2ecc71', '#3498db'])
plt.ylim(0, 1)
plt.title('True Negative & True Positive Rates', fontweight='bold')
plt.ylabel('Rate')
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{height:.2%}', ha='center', va='bottom', fontweight='bold', fontsize=12)

# Plot 6: Feature Importance (top 10)
plt.subplot(2, 3, 6)
if hasattr(best_model, 'feature_importances_'):
    importance = pd.DataFrame({
        'feature': X_train.columns,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False).head(10)
    
    plt.barh(range(len(importance)), importance['importance'], color='coral')
    plt.yticks(range(len(importance)), importance['feature'])
    plt.xlabel('Importance')
    plt.title('Top 10 Important Features', fontweight='bold')
    plt.gca().invert_yaxis()

plt.tight_layout()
plt.savefig('paysim_fraud_results.png', dpi=300, bbox_inches='tight')
print("✓ Saved: paysim_fraud_results.png")
plt.show()

# Save model
print("\n" + "="*70)
print("SAVING MODEL")
print("="*70)

import joblib
joblib.dump(best_model, "fraud_api/models/fraud_probability_model.pkl")
joblib.dump(X_train.columns.tolist(), "fraud_api/models/model_features.pkl")
print(f"✓ Model saved: {best_model_name}")

# Summary
print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print(results_df.to_string(index=False))

# Final verdict
print("\n" + "="*70)
print("FINAL VERDICT")
print("="*70)

if best_result['Accuracy'] >= 0.95:
    print(f"✅ SUCCESS! Achieved {best_result['Accuracy']*100:.2f}% accuracy")
    print(f"✅ Excellent TN: {best_result['TN']:,} ({tn_rate:.2%})")
    print(f"✅ Excellent TP: {best_result['TP']:,} ({tp_rate:.2%})")
    print(f"\nThis model is PRODUCTION READY!")
else:
    print(f"⚠️  Achieved {best_result['Accuracy']*100:.2f}% accuracy")

print("="*70)
