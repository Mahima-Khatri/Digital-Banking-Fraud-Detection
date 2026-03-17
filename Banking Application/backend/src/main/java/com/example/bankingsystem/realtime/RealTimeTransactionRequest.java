package com.example.bankingsystem.realtime;

public class RealTimeTransactionRequest {
    private String customerName;
    private String userId;
    private String transactionType;
    private String senderAccount;
    private String receiverAccount;
    private String location;
    private double amount;
    private String device;
    private String merchantName;

    // Constructors, getters, setters
    public RealTimeTransactionRequest() {}

    public RealTimeTransactionRequest(String customerName, String userId, String transactionType,
                                      String senderAccount, String receiverAccount, String location,
                                      double amount, String device, String merchantName) {
        this.customerName = customerName;
        this.userId = userId;
        this.transactionType = transactionType;
        this.senderAccount = senderAccount;
        this.receiverAccount = receiverAccount;
        this.location = location;
        this.amount = amount;
        this.device = device;
        this.merchantName = merchantName;
    }

    // Getters and setters
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

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

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getDevice() { return device; }
    public void setDevice(String device) { this.device = device; }

    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }
}