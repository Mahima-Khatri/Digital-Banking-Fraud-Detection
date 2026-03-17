package com.example.bankingsystem.hybrid;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hybrid_transactions")
public class HybridTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", unique = true, nullable = false)
    private String transactionId;

    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "oldbalance_org")
    private Double oldbalanceOrg;

    @Column(name = "newbalance_orig")
    private Double newbalanceOrig;

    @Column(name = "oldbalance_dest")
    private Double oldbalanceDest;

    @Column(name = "newbalance_dest")
    private Double newbalanceDest;

    private String location;
    private String device;

    @Column(name = "merchant_name")
    private String merchantName;

    @Column(name = "ml_score")
    private Double mlScore;

    @Column(name = "rule_score")
    private Double ruleScore;

    @Column(name = "combined_score")
    private Double combinedScore;

    @Column(name = "risk_level")
    private String riskLevel;

    private String status;

    @Column(name = "fraud_reasons", columnDefinition = "TEXT")
    private String fraudReasons;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @Column(name = "transaction_time")
    private LocalDateTime transactionTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

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

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDevice() { return device; }
    public void setDevice(String device) { this.device = device; }

    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }

    public Double getMlScore() { return mlScore; }
    public void setMlScore(Double mlScore) { this.mlScore = mlScore; }

    public Double getRuleScore() { return ruleScore; }
    public void setRuleScore(Double ruleScore) { this.ruleScore = ruleScore; }

    public Double getCombinedScore() { return combinedScore; }
    public void setCombinedScore(Double combinedScore) { this.combinedScore = combinedScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFraudReasons() { return fraudReasons; }
    public void setFraudReasons(String fraudReasons) { this.fraudReasons = fraudReasons; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
