package com.example.bankingsystem.basic;

public class TransactionRequest {

    private String userId;
    private String transactionType;
    private String senderAccount;
    private String receiverAccount;
    private String location;
    private String device;
    private double amount;

    // Constructors
    public TransactionRequest() {}

    public TransactionRequest(String userId, String transactionType, String senderAccount,
                             String receiverAccount, String location, String device, double amount) {
        this.userId = userId;
        this.transactionType = transactionType;
        this.senderAccount = senderAccount;
        this.receiverAccount = receiverAccount;
        this.location = location;
        this.device = device;
        this.amount = amount;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getSenderAccount() { return senderAccount; }
    public void setSenderAccount(String senderAccount) { this.senderAccount = senderAccount; }

    public String getReceiverAccount() { return receiverAccount; }
    public void setReceiverAccount(String receiverAccount) { this.receiverAccount = receiverAccount; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDevice() { return device; }
    public void setDevice(String device) { this.device = device; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}