package com.example.bankingsystem.analyst;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analyst_actions")
public class AnalystAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false)
    private String transactionId;

    @Column(name = "analyst_username", nullable = false)
    private String analystUsername;

    @Column(name = "action_type", nullable = false)
    private String actionType; // APPROVE, REJECT, ESCALATE, ADD_NOTE, WHITELIST, BLACKLIST

    @Column(name = "original_status")
    private String originalStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "action_time")
    private LocalDateTime actionTime;

    @PrePersist
    protected void onCreate() {
        actionTime = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getAnalystUsername() { return analystUsername; }
    public void setAnalystUsername(String analystUsername) { this.analystUsername = analystUsername; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getOriginalStatus() { return originalStatus; }
    public void setOriginalStatus(String originalStatus) { this.originalStatus = originalStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getActionTime() { return actionTime; }
    public void setActionTime(LocalDateTime actionTime) { this.actionTime = actionTime; }
}
