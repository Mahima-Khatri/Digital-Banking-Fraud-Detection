package com.example.bankingsystem.profile;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_risk_profiles")
public class UserRiskProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @Column(name = "total_transactions")
    private Integer totalTransactions = 0;

    @Column(name = "fraud_count")
    private Integer fraudCount = 0;

    @Column(name = "total_amount")
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "avg_transaction_amount")
    private BigDecimal avgTransactionAmount = BigDecimal.ZERO;

    @Column(name = "risk_score")
    private BigDecimal riskScore = BigDecimal.ZERO;

    @Column(name = "risk_level")
    private String riskLevel = "LOW";

    @Column(name = "first_transaction_date")
    private LocalDateTime firstTransactionDate;

    @Column(name = "last_transaction_date")
    private LocalDateTime lastTransactionDate;

    @Column(name = "common_locations", columnDefinition = "TEXT")
    private String commonLocations; // JSON array

    @Column(name = "common_devices", columnDefinition = "TEXT")
    private String commonDevices; // JSON array

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Integer getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(Integer totalTransactions) { this.totalTransactions = totalTransactions; }

    public Integer getFraudCount() { return fraudCount; }
    public void setFraudCount(Integer fraudCount) { this.fraudCount = fraudCount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getAvgTransactionAmount() { return avgTransactionAmount; }
    public void setAvgTransactionAmount(BigDecimal avgTransactionAmount) { this.avgTransactionAmount = avgTransactionAmount; }

    public BigDecimal getRiskScore() { return riskScore; }
    public void setRiskScore(BigDecimal riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public LocalDateTime getFirstTransactionDate() { return firstTransactionDate; }
    public void setFirstTransactionDate(LocalDateTime firstTransactionDate) { this.firstTransactionDate = firstTransactionDate; }

    public LocalDateTime getLastTransactionDate() { return lastTransactionDate; }
    public void setLastTransactionDate(LocalDateTime lastTransactionDate) { this.lastTransactionDate = lastTransactionDate; }

    public String getCommonLocations() { return commonLocations; }
    public void setCommonLocations(String commonLocations) { this.commonLocations = commonLocations; }

    public String getCommonDevices() { return commonDevices; }
    public void setCommonDevices(String commonDevices) { this.commonDevices = commonDevices; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
