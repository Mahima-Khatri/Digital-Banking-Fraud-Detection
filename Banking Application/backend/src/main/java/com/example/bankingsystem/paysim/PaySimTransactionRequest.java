package com.example.bankingsystem.paysim;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaySimTransactionRequest {
    
    @NotBlank(message = "Transaction type is required")
    private String type; // PAYMENT, TRANSFER, CASH_OUT, DEBIT, CASH_IN
    
    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be positive")
    private Double amount;
    
    @NotNull(message = "Sender's old balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    private Double oldbalanceOrg;
    
    @NotNull(message = "Sender's new balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    private Double newbalanceOrig;
    
    @NotNull(message = "Receiver's old balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    private Double oldbalanceDest;
    
    @NotNull(message = "Receiver's new balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    private Double newbalanceDest;

    // Behavioral fields for additional fraud detection
    private String userId;
    private String location;
    private String device;
    private String merchantName;
    
    // Account IDs for account-based fraud detection (NEW)
    private String senderAccountId;
    private String receiverAccountId;

    // Constructors
    public PaySimTransactionRequest() {}

    public PaySimTransactionRequest(String type, Double amount, Double oldbalanceOrg, 
                                   Double newbalanceOrig, Double oldbalanceDest, Double newbalanceDest) {
        this.type = type;
        this.amount = amount;
        this.oldbalanceOrg = oldbalanceOrg;
        this.newbalanceOrig = newbalanceOrig;
        this.oldbalanceDest = oldbalanceDest;
        this.newbalanceDest = newbalanceDest;
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getOldbalanceOrg() {
        return oldbalanceOrg;
    }

    public void setOldbalanceOrg(Double oldbalanceOrg) {
        this.oldbalanceOrg = oldbalanceOrg;
    }

    public Double getNewbalanceOrig() {
        return newbalanceOrig;
    }

    public void setNewbalanceOrig(Double newbalanceOrig) {
        this.newbalanceOrig = newbalanceOrig;
    }

    public Double getOldbalanceDest() {
        return oldbalanceDest;
    }

    public void setOldbalanceDest(Double oldbalanceDest) {
        this.oldbalanceDest = oldbalanceDest;
    }

    public Double getNewbalanceDest() {
        return newbalanceDest;
    }

    public void setNewbalanceDest(Double newbalanceDest) {
        this.newbalanceDest = newbalanceDest;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }

    public String getSenderAccountId() {
        return senderAccountId;
    }

    public void setSenderAccountId(String senderAccountId) {
        this.senderAccountId = senderAccountId;
    }

    public String getReceiverAccountId() {
        return receiverAccountId;
    }

    public void setReceiverAccountId(String receiverAccountId) {
        this.receiverAccountId = receiverAccountId;
    }

    @Override
    public String toString() {
        return "PaySimTransactionRequest{" +
                "type='" + type + '\'' +
                ", amount=" + amount +
                ", oldbalanceOrg=" + oldbalanceOrg +
                ", newbalanceOrig=" + newbalanceOrig +
                ", oldbalanceDest=" + oldbalanceDest +
                ", newbalanceDest=" + newbalanceDest +
                ", userId='" + userId + '\'' +
                ", location='" + location + '\'' +
                ", device='" + device + '\'' +
                ", merchantName='" + merchantName + '\'' +
                ", senderAccountId='" + senderAccountId + '\'' +
                ", receiverAccountId='" + receiverAccountId + '\'' +
                '}';
    }
}
