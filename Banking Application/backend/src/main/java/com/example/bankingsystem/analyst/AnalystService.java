package com.example.bankingsystem.analyst;

import com.example.bankingsystem.alert.Alert;
import com.example.bankingsystem.alert.AlertRepository;
import com.example.bankingsystem.hybrid.HybridTransaction;
import com.example.bankingsystem.hybrid.HybridTransactionRepository;
import com.example.bankingsystem.profile.UserRiskProfile;
import com.example.bankingsystem.profile.UserRiskProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AnalystService {

    @Autowired
    private AnalystActionRepository analystActionRepository;

    @Autowired
    private HybridTransactionRepository transactionRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRiskProfileRepository profileRepository;

    @Transactional
    public Map<String, Object> performAction(String transactionId, String analystUsername, 
                                             String actionType, String notes) {
        Optional<HybridTransaction> txnOpt = transactionRepository.findByTransactionId(transactionId);
        if (txnOpt.isEmpty()) {
            throw new RuntimeException("Transaction not found");
        }

        HybridTransaction transaction = txnOpt.get();
        String originalStatus = transaction.getStatus();
        String newStatus = originalStatus;

        // Determine new status based on action
        switch (actionType) {
            case "APPROVE":
                newStatus = "APPROVED";
                break;
            case "REJECT":
                newStatus = "BLOCKED";
                break;
            case "ESCALATE":
                newStatus = "ESCALATED";
                break;
        }

        // Save analyst action
        AnalystAction action = new AnalystAction();
        action.setTransactionId(transactionId);
        action.setAnalystUsername(analystUsername);
        action.setActionType(actionType);
        action.setOriginalStatus(originalStatus);
        action.setNewStatus(newStatus);
        action.setNotes(notes);
        analystActionRepository.save(action);

        // Update transaction status
        if (!newStatus.equals(originalStatus)) {
            transaction.setStatus(newStatus);
            transactionRepository.save(transaction);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("transactionId", transactionId);
        result.put("originalStatus", originalStatus);
        result.put("newStatus", newStatus);
        result.put("actionType", actionType);
        result.put("analystUsername", analystUsername);
        result.put("timestamp", LocalDateTime.now());

        return result;
    }

    public List<AnalystAction> getTransactionHistory(String transactionId) {
        return analystActionRepository.findByTransactionIdOrderByActionTimeDesc(transactionId);
    }

    public List<AnalystAction> getAnalystActions(String analystUsername) {
        return analystActionRepository.findByAnalystUsernameOrderByActionTimeDesc(analystUsername);
    }

    // Get unread alerts
    public List<Alert> getUnreadAlerts() {
        return alertRepository.findByIsReadFalseOrderByCreatedAtDesc();
    }

    // Mark alert as read
    @Transactional
    public void markAlertAsRead(Long alertId, String analystUsername) {
        Optional<Alert> alertOpt = alertRepository.findById(alertId);
        if (alertOpt.isPresent()) {
            Alert alert = alertOpt.get();
            alert.setIsRead(true);
            alert.setReadAt(LocalDateTime.now());
            alert.setAssignedTo(analystUsername);
            alertRepository.save(alert);
        }
    }

    // Get user risk profile
    public Map<String, Object> getUserRiskProfile(String userId) {
        Optional<UserRiskProfile> profileOpt = profileRepository.findByUserId(userId);
        
        if (profileOpt.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("userId", userId);
            result.put("exists", false);
            result.put("message", "No transaction history found for this user");
            return result;
        }

        UserRiskProfile profile = profileOpt.get();
        Map<String, Object> result = new HashMap<>();
        result.put("userId", profile.getUserId());
        result.put("exists", true);
        result.put("totalTransactions", profile.getTotalTransactions());
        result.put("fraudCount", profile.getFraudCount());
        result.put("totalAmount", profile.getTotalAmount());
        result.put("avgTransactionAmount", profile.getAvgTransactionAmount());
        result.put("riskScore", profile.getRiskScore());
        result.put("riskLevel", profile.getRiskLevel());
        result.put("firstTransactionDate", profile.getFirstTransactionDate());
        result.put("lastTransactionDate", profile.getLastTransactionDate());
        result.put("commonLocations", profile.getCommonLocations());
        result.put("commonDevices", profile.getCommonDevices());
        result.put("fraudRate", profile.getTotalTransactions() > 0 ? 
            (profile.getFraudCount() * 100.0 / profile.getTotalTransactions()) : 0);

        return result;
    }

    // Update user risk profile after transaction
    @Transactional
    public void updateUserRiskProfile(String userId, BigDecimal amount, String riskLevel, 
                                     String location, String device) {
        UserRiskProfile profile = profileRepository.findByUserId(userId)
            .orElse(new UserRiskProfile());

        if (profile.getId() == null) {
            profile.setUserId(userId);
            profile.setFirstTransactionDate(LocalDateTime.now());
        }

        profile.setTotalTransactions(profile.getTotalTransactions() + 1);
        profile.setTotalAmount(profile.getTotalAmount().add(amount));
        profile.setAvgTransactionAmount(
            profile.getTotalAmount().divide(BigDecimal.valueOf(profile.getTotalTransactions()), 2, BigDecimal.ROUND_HALF_UP)
        );
        profile.setLastTransactionDate(LocalDateTime.now());

        if ("HIGH".equals(riskLevel)) {
            profile.setFraudCount(profile.getFraudCount() + 1);
        }

        // Calculate overall risk score (0-100)
        double fraudRate = profile.getTotalTransactions() > 0 ? 
            (profile.getFraudCount() * 100.0 / profile.getTotalTransactions()) : 0;
        profile.setRiskScore(BigDecimal.valueOf(fraudRate));

        // Determine risk level
        if (fraudRate > 50) {
            profile.setRiskLevel("HIGH");
        } else if (fraudRate > 20) {
            profile.setRiskLevel("MEDIUM");
        } else {
            profile.setRiskLevel("LOW");
        }

        // Update common locations and devices (simplified - just append)
        profile.setCommonLocations(location);
        profile.setCommonDevices(device);

        profileRepository.save(profile);
    }

    /**
     * Calculate confusion matrix metrics
     * TP: High risk correctly identified as fraud (HIGH + BLOCKED)
     * FP: Low/Medium risk incorrectly flagged as fraud (LOW/MEDIUM + BLOCKED)
     * TN: Low/Medium risk correctly identified as legitimate (LOW/MEDIUM + APPROVED)
     * FN: High risk missed as legitimate (HIGH + APPROVED)
     */
    public Map<String, Object> getConfusionMatrixMetrics() {
        List<HybridTransaction> allTransactions = transactionRepository.findAll();
        
        int truePositive = 0;   // HIGH risk + BLOCKED
        int falsePositive = 0;  // LOW/MEDIUM risk + BLOCKED
        int trueNegative = 0;   // LOW/MEDIUM risk + APPROVED
        int falseNegative = 0;  // HIGH risk + APPROVED

        for (HybridTransaction txn : allTransactions) {
            String riskLevel = txn.getRiskLevel();
            String status = txn.getStatus();

            if ("HIGH".equals(riskLevel)) {
                if ("BLOCKED".equals(status)) {
                    truePositive++;
                } else if ("APPROVED".equals(status)) {
                    falseNegative++;
                }
            } else { // LOW or MEDIUM
                if ("BLOCKED".equals(status)) {
                    falsePositive++;
                } else if ("APPROVED".equals(status)) {
                    trueNegative++;
                }
            }
        }

        // Calculate performance metrics
        int total = truePositive + falsePositive + trueNegative + falseNegative;
        double accuracy = total > 0 ? (double)(truePositive + trueNegative) / total : 0;
        double precision = (truePositive + falsePositive) > 0 ? 
            (double)truePositive / (truePositive + falsePositive) : 0;
        double recall = (truePositive + falseNegative) > 0 ? 
            (double)truePositive / (truePositive + falseNegative) : 0;
        double f1Score = (precision + recall) > 0 ? 
            2 * (precision * recall) / (precision + recall) : 0;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("truePositive", truePositive);
        metrics.put("falsePositive", falsePositive);
        metrics.put("trueNegative", trueNegative);
        metrics.put("falseNegative", falseNegative);
        metrics.put("accuracy", accuracy);
        metrics.put("precision", precision);
        metrics.put("recall", recall);
        metrics.put("f1Score", f1Score);
        metrics.put("totalTransactions", total);

        return metrics;
    }
}
