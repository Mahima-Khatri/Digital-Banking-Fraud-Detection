package com.example.bankingsystem.hybrid;

import com.example.bankingsystem.paysim.FraudReason;
import java.time.LocalDateTime;
import java.util.List;

public class HybridFraudDetectionResponse {
    private String transactionId;
    private Double mlScore;
    private Double ruleBasedScore;
    private Double combinedScore;
    private Double combinedPercentage;
    private Boolean isFraud;
    private String riskLevel;
    private String recommendation;
    private String status;
    private List<FraudReason> reasons;
    private LocalDateTime transactionTime;

    public HybridFraudDetectionResponse() {}

    public HybridFraudDetectionResponse(String transactionId, Double mlScore, Double ruleBasedScore,
                                       Double combinedScore, Double combinedPercentage, Boolean isFraud,
                                       String riskLevel, String recommendation, String status,
                                       List<FraudReason> reasons, LocalDateTime transactionTime) {
        this.transactionId = transactionId;
        this.mlScore = mlScore;
        this.ruleBasedScore = ruleBasedScore;
        this.combinedScore = combinedScore;
        this.combinedPercentage = combinedPercentage;
        this.isFraud = isFraud;
        this.riskLevel = riskLevel;
        this.recommendation = recommendation;
        this.status = status;
        this.reasons = reasons;
        this.transactionTime = transactionTime;
    }

    // Getters and Setters
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Double getMlScore() { return mlScore; }
    public void setMlScore(Double mlScore) { this.mlScore = mlScore; }

    public Double getRuleBasedScore() { return ruleBasedScore; }
    public void setRuleBasedScore(Double ruleBasedScore) { this.ruleBasedScore = ruleBasedScore; }

    public Double getCombinedScore() { return combinedScore; }
    public void setCombinedScore(Double combinedScore) { this.combinedScore = combinedScore; }

    public Double getCombinedPercentage() { return combinedPercentage; }
    public void setCombinedPercentage(Double combinedPercentage) { this.combinedPercentage = combinedPercentage; }

    public Boolean getIsFraud() { return isFraud; }
    public void setIsFraud(Boolean isFraud) { this.isFraud = isFraud; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<FraudReason> getReasons() { return reasons; }
    public void setReasons(List<FraudReason> reasons) { this.reasons = reasons; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }
}
