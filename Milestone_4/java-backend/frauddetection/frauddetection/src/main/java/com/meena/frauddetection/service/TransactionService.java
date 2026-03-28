package com.meena.frauddetection.service;

import com.meena.frauddetection.model.PaymentTransaction;
import com.meena.frauddetection.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TransactionService {

    private final TransactionRepository repository;
    private final FraudService fraudService;

    public TransactionService(TransactionRepository repository, FraudService fraudService) {
        this.repository = repository;
        this.fraudService = fraudService;
    }

    public PaymentTransaction processTransaction(PaymentTransaction transaction) {
        // ⏱️ Start timing for telemetry
        long startTime = System.currentTimeMillis();

        if (transaction.getTransactionId() == null) {
            transaction.setTransactionId("TXN-" + System.currentTimeMillis());
        }

        double amount = transaction.getAmount();
        
        // Explicitly initialize variables to avoid flag leakage
        String riskLevel = "SAFE";
        boolean isFraud = false;
        boolean isMediumRisk = false;
        double fraudScore = 0.0;

        // 🔥 Granular Security & Behavioral Analysis
        java.util.List<String> redFlags = new java.util.ArrayList<>();
        boolean isInternational = "International / Proxy".equals(transaction.getSenderLocation());
        boolean isUnverifiedDevice = !"Authorized Device".equals(transaction.getSenderDevice());
        boolean isSuspiciousTime = false;

        // Detect Suspicious After-Hours Activity (12 AM - 5 AM)
        try {
            String timeStr = transaction.getTransactionTime();
            if (timeStr != null && timeStr.toLowerCase().contains("am")) {
                int hour = Integer.parseInt(timeStr.split(":")[0].trim());
                if (hour == 12 || hour < 5) {
                    isSuspiciousTime = true;
                }
            }
        } catch (Exception e) {}

        // Identify Specific Red Flags
        if (isInternational) redFlags.add("Unknown Location (International/Proxy)");
        if (isUnverifiedDevice) redFlags.add("Unrecognized Device (" + transaction.getSenderDevice() + ")");
        if (isSuspiciousTime) redFlags.add("Suspicious Transaction Time (After-Hours)");
        if (amount > 50000) redFlags.add("Critical Amount Threshold (₹" + Math.round(amount) + ")");
        else if (amount > 20000) redFlags.add("Unusual Spending Pattern (₹" + Math.round(amount) + ")");

        // Decision Engine based on Red Flag Count & Severity (LEGACY RULES)
        if (isInternational || amount > 50000 || redFlags.size() >= 2) {
            riskLevel = "HIGH";
            isFraud = true;
            isMediumRisk = false;
            fraudScore = 0.85 + (Math.random() * 0.14);
            transaction.setStatus("BLOCKED");
            transaction.setPrediction("Fraud Detected - Blocked");
        } 
        else if (amount > 20000 || isUnverifiedDevice || isSuspiciousTime) {
            riskLevel = "MEDIUM";
            isFraud = false;
            isMediumRisk = true;
            fraudScore = 0.40 + (Math.random() * 0.25);
            transaction.setStatus("PENDING REVIEW");
            transaction.setPrediction("Suspicious Activity - Pending Review");
        } 
        else {
            riskLevel = "SAFE";
            isFraud = false;
            isMediumRisk = false;
            fraudScore = 0.02 + (Math.random() * 0.15);
            transaction.setStatus("SAFE - APPROVED");
            transaction.setPrediction("Verified Safe");
        }

        // Build Varied & Context-Aware Reason Strings
        String displayReason = "Normal behavior";
        java.util.List<String> simpleReasons = new java.util.ArrayList<>();
        if (amount > 50000) simpleReasons.add("High Amount (>50000)");
        if (isUnverifiedDevice) simpleReasons.add("New Device");
        if (isInternational) simpleReasons.add("Suspicious Location (International / Proxy)");
        
        if (!simpleReasons.isEmpty()) {
            displayReason = String.join(", ", simpleReasons);
        }

        // --- SHADOW MODE ML INTEGRATION ---
        // Call the Python FastAPI ML Model safely (it has a fallback if the server is offline)
        Map<String, Object> mlResult = fraudService.checkFraud(transaction);
        String mlPrediction = (String) mlResult.getOrDefault("prediction", "Safe/Unknown");
        String mlMessage = (String) mlResult.getOrDefault("message", "Success");
        
        System.out.println("\n=== 🤖 SHADOW MODE ML COMPARISON ===");
        System.out.println("Transaction ID      : " + transaction.getTransactionId());
        System.out.println("Amount              : " + amount);
        System.out.println("Legacy Rule Verdict : " + (isFraud ? "Fraud" : "Safe") + " (Risk Level: " + riskLevel + ")");
        System.out.println("Python ML Verdict   : " + mlPrediction);
        System.out.println("ML Service Status   : " + mlMessage);
        System.out.println("=====================================\n");

        // Set the final transaction properties (Keeping Legacy Rules for safety as requested)
        transaction.setRiskLevel(riskLevel);
        transaction.setIsFraud(isFraud);
        transaction.setIsMediumRisk(isMediumRisk);
        transaction.setFraudScore(fraudScore);
        transaction.setRiskReason(redFlags.isEmpty() ? "Normal behavior" : String.join(", ", redFlags));
        transaction.setReason(displayReason);

        PaymentTransaction savedTx = repository.save(transaction);

        // ⏱️ Record how long this analysis took
        long elapsed = System.currentTimeMillis() - startTime;
        PerformanceTracker.recordAnalysisLatency(elapsed);
        System.out.println("⏱️ Analysis latency: " + elapsed + " ms");

        return savedTx;
    }
}