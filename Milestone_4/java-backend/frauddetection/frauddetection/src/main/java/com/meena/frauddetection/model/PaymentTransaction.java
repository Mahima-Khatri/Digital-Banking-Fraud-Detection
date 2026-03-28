package com.meena.frauddetection.model;

import jakarta.persistence.*;

@Entity
@Table(name = "payment_transaction")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transactionId;
    private String transactionType;
    private String transactionMode;
    private double amount;
    private String senderId;
    private String senderAccount;
    private String senderMobile;
    private String senderDevice;
    private String senderLocation;
    private String receiverId;
    private String receiverAccount;
    private String receiverMobile;
    private String receiverLocation;
    private String authType;
    private String transactionTime;

    private String riskLevel;
    private boolean isFraud;
    private boolean isMediumRisk;
    private double fraudScore;
    private String status;
    private String prediction;

    private Double latitude;
    private Double longitude;
    private String riskReason;
    private String country;
    private String reason;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getTransactionMode() { return transactionMode; }
    public void setTransactionMode(String transactionMode) { this.transactionMode = transactionMode; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderAccount() { return senderAccount; }
    public void setSenderAccount(String senderAccount) { this.senderAccount = senderAccount; }

    public String getSenderMobile() { return senderMobile; }
    public void setSenderMobile(String senderMobile) { this.senderMobile = senderMobile; }

    public String getSenderDevice() { return senderDevice; }
    public void setSenderDevice(String senderDevice) { this.senderDevice = senderDevice; }

    public String getSenderLocation() { return senderLocation; }
    public void setSenderLocation(String senderLocation) { this.senderLocation = senderLocation; }

    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }

    public String getReceiverAccount() { return receiverAccount; }
    public void setReceiverAccount(String receiverAccount) { this.receiverAccount = receiverAccount; }

    public String getReceiverMobile() { return receiverMobile; }
    public void setReceiverMobile(String receiverMobile) { this.receiverMobile = receiverMobile; }

    public String getReceiverLocation() { return receiverLocation; }
    public void setReceiverLocation(String receiverLocation) { this.receiverLocation = receiverLocation; }

    public String getAuthType() { return authType; }
    public void setAuthType(String authType) { this.authType = authType; }

    public String getTransactionTime() { return transactionTime; }
    public void setTransactionTime(String transactionTime) { this.transactionTime = transactionTime; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public boolean getIsFraud() { return isFraud; }
    public void setIsFraud(boolean isFraud) { this.isFraud = isFraud; }

    public boolean getIsMediumRisk() { return isMediumRisk; }
    public void setIsMediumRisk(boolean isMediumRisk) { this.isMediumRisk = isMediumRisk; }

    public double getFraudScore() { return fraudScore; }
    public void setFraudScore(double fraudScore) { this.fraudScore = fraudScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getRiskReason() { return riskReason; }
    public void setRiskReason(String riskReason) { this.riskReason = riskReason; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}