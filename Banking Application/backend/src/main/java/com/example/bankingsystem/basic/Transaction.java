package com.example.bankingsystem.basic;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "transaction_type")
    private String transactionType;

    @Column(name = "sender_account")
    private String senderAccount;

    @Column(name = "receiver_account")
    private String receiverAccount;

    @Column(name = "location")
    private String location;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "status")
    private String status;

    @Column(name = "fraud_score")
    private Integer fraudScore;

    @Column(name = "transaction_time")
    private LocalDateTime transactionTime;

    // Constructors
    public Transaction() {}

    public Transaction(String transactionId, String userId, String transactionType,
                      String senderAccount, String receiverAccount, String location,
                      Double amount, String status, Integer fraudScore, LocalDateTime transactionTime) {
        this.transactionId = transactionId;
        this.userId = userId;
        this.transactionType = transactionType;
        this.senderAccount = senderAccount;
        this.receiverAccount = receiverAccount;
        this.location = location;
        this.amount = amount;
        this.status = status;
        this.fraudScore = fraudScore;
        this.transactionTime = transactionTime;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

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

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getFraudScore() { return fraudScore; }
    public void setFraudScore(Integer fraudScore) { this.fraudScore = fraudScore; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }
}