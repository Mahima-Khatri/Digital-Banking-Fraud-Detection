package com.example.bankingsystem.paysim;

import java.time.LocalDateTime;
import java.util.List;

public class PaySimTransactionResponse {
    private String transactionId;
    private Double fraudScore;
    private Double fraudPercentage;
    private Boolean isFraud;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private List<FraudReason> reasons;
    private String recommendation; // ALLOW, HOLD, BLOCK
    private LocalDateTime transactionTime;
    private String status; // APPROVED, BLOCKED, HOLD

    // Constructors
    public PaySimTransactionResponse() {}

    public PaySimTransactionResponse(String transactionId, Double fraudScore, Double fraudPercentage,
                                    Boolean isFraud, String riskLevel, List<FraudReason> reasons,
                                    String recommendation, LocalDateTime transactionTime, String status) {
        this.transactionId = transactionId;
        this.fraudScore = fraudScore;
        this.fraudPercentage = fraudPercentage;
        this.isFraud = isFraud;
        this.riskLevel = riskLevel;
        this.reasons = reasons;
        this.recommendation = recommendation;
        this.transactionTime = transactionTime;
        this.status = status;
    }

    // Getters and Setters
    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public Double getFraudScore() {
        return fraudScore;
    }

    public void setFraudScore(Double fraudScore) {
        this.fraudScore = fraudScore;
    }

    public Double getFraudPercentage() {
        return fraudPercentage;
    }

    public void setFraudPercentage(Double fraudPercentage) {
        this.fraudPercentage = fraudPercentage;
    }

    public Boolean getIsFraud() {
        return isFraud;
    }

    public void setIsFraud(Boolean isFraud) {
        this.isFraud = isFraud;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<FraudReason> getReasons() {
        return reasons;
    }

    public void setReasons(List<FraudReason> reasons) {
        this.reasons = reasons;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(LocalDateTime transactionTime) {
        this.transactionTime = transactionTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
