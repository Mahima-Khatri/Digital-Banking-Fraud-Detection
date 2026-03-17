package com.example.bankingsystem.realtime;

import java.time.LocalDateTime;

public class RealTimeTransactionResponse {
    private String transactionId;
    private String status;
    private int fraudScore;
    private String reasons;
    private double updatedBalance;
    private LocalDateTime transactionTime;

    // Constructors, getters, setters
    public RealTimeTransactionResponse() {}

    public RealTimeTransactionResponse(String transactionId, String status, int fraudScore,
                                       String reasons, double updatedBalance, LocalDateTime transactionTime) {
        this.transactionId = transactionId;
        this.status = status;
        this.fraudScore = fraudScore;
        this.reasons = reasons;
        this.updatedBalance = updatedBalance;
        this.transactionTime = transactionTime;
    }

    // Getters and setters
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getFraudScore() { return fraudScore; }
    public void setFraudScore(int fraudScore) { this.fraudScore = fraudScore; }

    public String getReasons() { return reasons; }
    public void setReasons(String reasons) { this.reasons = reasons; }

    public double getUpdatedBalance() { return updatedBalance; }
    public void setUpdatedBalance(double updatedBalance) { this.updatedBalance = updatedBalance; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }
}