package com.example.bankingsystem.hybrid;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class HybridTransactionRequest {
    
    // PaySim fields
    @NotBlank(message = "Transaction type is required")
    private String type;
    
    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be positive")
    private Double amount;
    
    @NotNull(message = "Sender's old balance is required")
    private Double oldbalanceOrg;
    
    @NotNull(message = "Sender's new balance is required")
    private Double newbalanceOrig;
    
    @NotNull(message = "Receiver's old balance is required")
    private Double oldbalanceDest;
    
    @NotNull(message = "Receiver's new balance is required")
    private Double newbalanceDest;

    // Additional fields for rule-based detection
    private String userId;
    private String location;
    private String device;
    private String merchantName;
    
    // Account IDs for account-based fraud detection (NEW)
    private String senderAccountId;
    private String receiverAccountId;

    // Constructors, Getters, Setters
    public HybridTransactionRequest() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Double getOldbalanceOrg() { return oldbalanceOrg; }
    public void setOldbalanceOrg(Double oldbalanceOrg) { this.oldbalanceOrg = oldbalanceOrg; }

    public Double getNewbalanceOrig() { return newbalanceOrig; }
    public void setNewbalanceOrig(Double newbalanceOrig) { this.newbalanceOrig = newbalanceOrig; }

    public Double getOldbalanceDest() { return oldbalanceDest; }
    public void setOldbalanceDest(Double oldbalanceDest) { this.oldbalanceDest = oldbalanceDest; }

    public Double getNewbalanceDest() { return newbalanceDest; }
    public void setNewbalanceDest(Double newbalanceDest) { this.newbalanceDest = newbalanceDest; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDevice() { return device; }
    public void setDevice(String device) { this.device = device; }

    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }

    public String getSenderAccountId() { return senderAccountId; }
    public void setSenderAccountId(String senderAccountId) { this.senderAccountId = senderAccountId; }

    public String getReceiverAccountId() { return receiverAccountId; }
    public void setReceiverAccountId(String receiverAccountId) { this.receiverAccountId = receiverAccountId; }
}
