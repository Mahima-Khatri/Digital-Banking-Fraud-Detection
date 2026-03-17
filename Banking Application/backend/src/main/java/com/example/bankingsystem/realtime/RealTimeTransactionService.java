package com.example.bankingsystem.realtime;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.stereotype.Service;

@Service
public class RealTimeTransactionService {

    private final DataSource dataSource;

    public RealTimeTransactionService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private double balance = 100000;
    private int safeCount = 0;
    private int suspiciousCount = 0;
    private int highRiskCount = 0;

    private Map<String, Integer> transactionFrequency = new HashMap<>();
    private Map<String, Integer> failureCount = new HashMap<>();
    private Map<String, LocalDateTime> lastTransactionTime = new HashMap<>();
    private String registeredLocation = "Mumbai";
    private String registeredDevice = "DEV001";

    public RealTimeTransactionResponse processTransaction(RealTimeTransactionRequest request) {
        String transactionId = "TXN" + String.format("%05d", (int)(Math.random() * 100000));
        LocalDateTime now = LocalDateTime.now();

        int fraudScore = calculateFraudScore(request, now);
        String reasons = buildReasons(request, now);

        String status;
        if (fraudScore >= 60) {
            status = "HIGH RISK - BLOCKED";
            highRiskCount++;
        } else if (fraudScore >= 30) {
            status = "SUSPICIOUS - ALLOWED";
            suspiciousCount++;
            updateBalance(request.getTransactionType(), request.getAmount());
        } else {
            status = "SAFE - APPROVED";
            safeCount++;
            updateBalance(request.getTransactionType(), request.getAmount());
        }

        // Save to database
        saveToDatabase(request, transactionId, status, fraudScore, reasons, now);

        return new RealTimeTransactionResponse(transactionId, status, fraudScore, reasons, balance, now);
    }

    private int calculateFraudScore(RealTimeTransactionRequest request, LocalDateTime now) {
        int fraudScore = 0;
        double amount = request.getAmount();
        String userId = request.getUserId();
        String location = request.getLocation();
        String device = request.getDevice();
        String transactionType = request.getTransactionType();

        transactionFrequency.put(userId, transactionFrequency.getOrDefault(userId, 0) + 1);

        // Existing Scoring Rules
        if (amount > 90000) {
            fraudScore += 50;
        } else if (amount > 75000) {
            fraudScore += 30;
        }

        if (transactionFrequency.get(userId) > 5) {
            fraudScore += 25;
        }

        if (!location.equalsIgnoreCase(registeredLocation)) {
            fraudScore += 20;
        }

        if (!device.equalsIgnoreCase(registeredDevice)) {
            fraudScore += 20;
        }

        if (transactionType.equals("DEBIT") && amount > balance) {
            fraudScore += 40;
        }

        // New Rules: Rapid transactions
        LocalDateTime lastTime = lastTransactionTime.get(userId);
        if (lastTime != null && java.time.Duration.between(lastTime, now).toMinutes() < 5) {
            fraudScore += 30;
        }

        // Previous failures
        int fails = failureCount.getOrDefault(userId, 0);
        if (fails > 0) {
            fraudScore += Math.min(fails * 10, 30);
        }

        // Merchant-based rules
        String merchantName = request.getMerchantName();
        if (merchantName != null && (merchantName.toLowerCase().contains("anonymous") || merchantName.toLowerCase().contains("suspicious"))) {
            fraudScore += 25;
        }

        // Round amounts
        if (amount % 1000 == 0 && amount >= 10000) {
            fraudScore += 15;
        }

        // Time-based
        int hour = now.getHour();
        if (hour >= 0 && hour <= 6) {
            fraudScore += 20;
        }

        // Very high frequency
        if (transactionFrequency.get(userId) > 10) {
            fraudScore += 35;
        }

        // Suspicious locations
        if (location.toLowerCase().contains("unknown") || location.toLowerCase().contains("foreign")) {
            fraudScore += 25;
        }

        

        lastTransactionTime.put(userId, now);

        return fraudScore;
    }

    private String buildReasons(RealTimeTransactionRequest request, LocalDateTime now) {
        StringBuilder reasons = new StringBuilder();
        double amount = request.getAmount();
        String userId = request.getUserId();
        String location = request.getLocation();
        String device = request.getDevice();
        String transactionType = request.getTransactionType();
        String merchantName = request.getMerchantName();

        if (amount > 90000) {
            reasons.append("High amount (>90k); ");
        } else if (amount > 75000) {
            reasons.append("Very high amount (>75k); ");
        }

        if (transactionFrequency.get(userId) > 5) {
            reasons.append("High transaction frequency; ");
        }

        if (!location.equalsIgnoreCase(registeredLocation)) {
            reasons.append("Unusual location; ");
        }

        if (!device.equalsIgnoreCase(registeredDevice)) {
            reasons.append("Unusual device; ");
        }

        if (transactionType.equals("DEBIT") && amount > balance) {
            reasons.append("Insufficient balance for debit; ");
        }

        LocalDateTime lastTime = lastTransactionTime.get(userId);
        if (lastTime != null && java.time.Duration.between(lastTime, now).toMinutes() < 5) {
            reasons.append("Rapid transactions (<5 min apart); ");
        }

        int fails = failureCount.getOrDefault(userId, 0);
        if (fails > 0) {
            reasons.append("Previous transaction failures (").append(fails).append("); ");
        }

        if (merchantName != null && (merchantName.toLowerCase().contains("anonymous") || merchantName.toLowerCase().contains("suspicious"))) {
            reasons.append("Anonymous/suspicious merchant; ");
        }

        if (amount % 1000 == 0 && amount >= 10000) {
            reasons.append("Round amount (potential money laundering); ");
        }

        int hour = now.getHour();
        if (hour >= 0 && hour <= 6) {
            reasons.append("Unusual transaction time (midnight-6am); ");
        }

        if (transactionFrequency.get(userId) > 10) {
            reasons.append("Very high transaction frequency; ");
        }

        if (location.toLowerCase().contains("unknown") || location.toLowerCase().contains("foreign")) {
            reasons.append("Suspicious location; ");
        }

        return reasons.toString().trim();
    }

    private void updateBalance(String transactionType, double amount) {
        if ("DEBIT".equalsIgnoreCase(transactionType)) {
            balance -= amount;
        } else if ("CREDIT".equalsIgnoreCase(transactionType)) {
            balance += amount;
        }
    }

    private void saveToDatabase(RealTimeTransactionRequest request, String transactionId, String status, int fraudScore, String reasons, LocalDateTime now) {
        try (Connection con = dataSource.getConnection()) {
            String query = "INSERT INTO transactions " +
                    "(transaction_id, user_id, transaction_type, sender_account, receiver_account, location, amount, status, fraud_score, merchant_name, reasons, transaction_time) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            try (PreparedStatement ps = con.prepareStatement(query)) {
                ps.setString(1, transactionId);
                ps.setString(2, request.getUserId());
                ps.setString(3, request.getTransactionType());
                ps.setString(4, request.getSenderAccount());
                ps.setString(5, request.getReceiverAccount());
                ps.setString(6, request.getLocation());
                ps.setDouble(7, request.getAmount());
                ps.setString(8, status);
                ps.setInt(9, fraudScore);
                ps.setString(10, request.getMerchantName());
                ps.setString(11, reasons);
                ps.setObject(12, now);

                ps.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}