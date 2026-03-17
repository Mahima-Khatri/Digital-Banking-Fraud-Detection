package com.example.bankingsystem.hybrid;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Real-time transaction request - BEFORE transaction happens
 * System calculates expected balances and checks for fraud
 * 
 * NOTE: In real banking, we only know SENDER's balance, not receiver's
 * Receiver balance is optional and used only for internal transfers
 */
public class RealTimeTransactionRequest {
    
    @NotBlank(message = "Transaction type is required")
    private String type; // PAYMENT, TRANSFER, CASH_OUT, DEBIT, CASH_IN
    
    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be positive")
    private Double amount;
    
    // CURRENT balance of sender (before transaction)
    @NotNull(message = "Sender's current balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    private Double senderCurrentBalance;
    
    // Receiver's current balance (OPTIONAL - only for internal transfers)
    // In real-world: We don't know external account balances
    private Double receiverCurrentBalance;
    
    // Behavioral fields
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotBlank(message = "Device is required")
    private String device;
    
    @NotBlank(message = "Merchant name is required")
    private String merchantName;
    
    // Account identifiers (NEW - for realistic banking)
    @NotBlank(message = "Sender account ID is required")
    private String senderAccountId;
    
    @NotBlank(message = "Receiver account ID is required")
    private String receiverAccountId;
    
    // Receiver type (helps determine if we can check balance)
    private String receiverType; // INTERNAL, EXTERNAL, UPI, PHONE

    // Constructors
    public RealTimeTransactionRequest() {}

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

    public Double getSenderCurrentBalance() {
        return senderCurrentBalance;
    }

    public void setSenderCurrentBalance(Double senderCurrentBalance) {
        this.senderCurrentBalance = senderCurrentBalance;
    }

    public Double getReceiverCurrentBalance() {
        return receiverCurrentBalance;
    }

    public void setReceiverCurrentBalance(Double receiverCurrentBalance) {
        this.receiverCurrentBalance = receiverCurrentBalance;
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

    /**
     * Calculate expected sender balance after transaction
     */
    public Double calculateExpectedSenderBalance() {
        if (type.equalsIgnoreCase("DEBIT") || 
            type.equalsIgnoreCase("TRANSFER") || 
            type.equalsIgnoreCase("CASH_OUT") ||
            type.equalsIgnoreCase("PAYMENT")) {
            return senderCurrentBalance - amount;
        } else if (type.equalsIgnoreCase("CREDIT") || 
                   type.equalsIgnoreCase("CASH_IN")) {
            return senderCurrentBalance + amount;
        }
        return senderCurrentBalance;
    }

    /**
     * Calculate expected receiver balance after transaction
     */
    public Double calculateExpectedReceiverBalance() {
        if (type.equalsIgnoreCase("TRANSFER") || 
            type.equalsIgnoreCase("PAYMENT") ||
            type.equalsIgnoreCase("CASH_OUT")) {
            return receiverCurrentBalance + amount;
        }
        return receiverCurrentBalance;
    }

    @Override
    public String toString() {
        return "RealTimeTransactionRequest{" +
                "type='" + type + '\'' +
                ", amount=" + amount +
                ", senderCurrentBalance=" + senderCurrentBalance +
                ", receiverCurrentBalance=" + receiverCurrentBalance +
                ", userId='" + userId + '\'' +
                ", location='" + location + '\'' +
                ", device='" + device + '\'' +
                ", merchantName='" + merchantName + '\'' +
                '}';
    }
}
