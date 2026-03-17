package com.example.bankingsystem.paysim;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;

@Service
public class PaySimFraudDetectionService {

    private Map<String, Integer> userTransactionCount = new HashMap<>();
    private Map<String, LocalDateTime> userLastTransaction = new HashMap<>();
    private Map<String, String> userRegisteredLocation = new HashMap<>();
    private Map<String, String> userRegisteredDevice = new HashMap<>();
    private Map<String, List<String>> userLocationHistory = new HashMap<>();

    private Map<String, Set<String>> userAccounts = new HashMap<>();
    private Map<String, LocalDateTime> accountLastUsed = new HashMap<>();
    private Map<String, Integer> accountTransactionCount = new HashMap<>();
    private Map<String, LocalDateTime> accountCreationDate = new HashMap<>();

    public PaySimTransactionResponse processTransaction(PaySimTransactionRequest request) {
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        LocalDateTime transactionTime = LocalDateTime.now();

        String userId = request.getUserId() != null ? request.getUserId() : "UNKNOWN";
        String location = request.getLocation() != null ? request.getLocation() : "UNKNOWN";
        String device = request.getDevice() != null ? request.getDevice() : "UNKNOWN";
        String merchantName = request.getMerchantName() != null ? request.getMerchantName() : "UNKNOWN";
        String senderAccountId = request.getSenderAccountId() != null ? request.getSenderAccountId() : "UNKNOWN";
        String receiverAccountId = request.getReceiverAccountId() != null ? request.getReceiverAccountId() : "UNKNOWN";

        double fraudScore = calculateFraudScore(request, userId, location, device, merchantName,
                senderAccountId, receiverAccountId, transactionTime);
        double fraudPercentage = fraudScore * 100;

        List<FraudReason> reasons = analyzeFraudReasons(request, fraudScore, userId, location, device,
                merchantName, senderAccountId, receiverAccountId, transactionTime);

        String riskLevel;
        boolean isFraud;
        String recommendation;
        String status;

        // UPDATED RISK THRESHOLDS FOR BETTER CATEGORIZATION
        if (fraudScore >= 0.7) {
            riskLevel = "HIGH";
            isFraud = true;
            recommendation = "BLOCK transaction immediately";
            status = "BLOCKED";
        } else if (fraudScore >= 0.35) {
            riskLevel = "MEDIUM";
            isFraud = false;
            recommendation = "HOLD transaction for manual review";
            status = "HOLD";
        } else {
            riskLevel = "LOW";
            isFraud = false;
            recommendation = "ALLOW transaction";
            status = "APPROVED";
        }

        return new PaySimTransactionResponse(
                transactionId, fraudScore, fraudPercentage, isFraud, riskLevel, reasons, recommendation, transactionTime, status
        );
    }

    private double calculateFraudScore(PaySimTransactionRequest request, String userId,
                                       String location, String device, String merchantName,
                                       String senderAccountId, String receiverAccountId,
                                       LocalDateTime transactionTime) {
        double score = 0.0;

        String type = request.getType().toUpperCase();
        double amount = request.getAmount();
        double oldBalOrg = request.getOldbalanceOrg();
        double newBalOrg = request.getNewbalanceOrig();
        double oldBalDest = request.getOldbalanceDest();
        double newBalDest = request.getNewbalanceDest();

        // ========== CUSTOM AMOUNT-BASED RULES (AS REQUESTED) ==========

        if (amount > 50000) {
            score += 0.50; // High Score contribution for High Risk
        } else if (amount >= 30000) {
            score += 0.25; // Moderate contribution for Medium Risk
        }

        // RULE 1: Transaction Type
        if (type.equals("TRANSFER")) score += 0.20;
        else if (type.equals("CASH_OUT")) score += 0.15;

        // RULE 2: Account Emptying
        if (newBalOrg == 0 && oldBalOrg > 0) score += 0.35;

        // RULE 4 & 5: Balance Inconsistencies
        if (Math.abs(oldBalOrg - newBalOrg - amount) > 0.01) score += 0.15;
        if (Math.abs(newBalDest - oldBalDest - amount) > 0.01) score += 0.10;

        // RULE 6: Mule Account
        if (oldBalDest == 0 && newBalDest > 0) score += 0.10;

        // RULE 12: Rapid Timing
        LocalDateTime lastTx = userLastTransaction.get(userId);
        if (lastTx != null) {
            long secondsBetween = java.time.Duration.between(lastTx, transactionTime).getSeconds();
            if (secondsBetween < 30) score += 0.40;
        }
        userLastTransaction.put(userId, transactionTime);

        // RULE 13: Location Change
        String registeredLoc = userRegisteredLocation.get(userId);
        if (registeredLoc == null) userRegisteredLocation.put(userId, location);
        else if (!registeredLoc.equals(location)) score += 0.20;

        return Math.min(score, 1.0);
    }

    private List<FraudReason> analyzeFraudReasons(PaySimTransactionRequest request, double fraudScore,
                                                  String userId, String location, String device,
                                                  String merchantName, String senderAccountId,
                                                  String receiverAccountId, LocalDateTime transactionTime) {
        List<FraudReason> reasons = new ArrayList<>();
        double amount = request.getAmount();

        // --- Amount Based Reasons ---
        if (amount > 50000) {
            reasons.add(new FraudReason(String.format("High value transaction detected: ₹%.2f (Limit: ₹50,000)", amount), ""));
        } else if (amount >= 30000) {
            reasons.add(new FraudReason(String.format("Medium value transaction flagged for review: ₹%.2f", amount), ""));
        }

        // --- Standard PaySim Pattern Reasons ---
        if (request.getNewbalanceOrig() == 0 && request.getOldbalanceOrg() > 0) {
            reasons.add(new FraudReason("Pattern Match: Sender account emptied completely", ""));
        }

        if (request.getOldbalanceDest() == 0 && request.getNewbalanceDest() > 0) {
            reasons.add(new FraudReason("Receiver account was previously empty (Mule behavior)", ""));
        }

        String registeredLoc = userRegisteredLocation.get(userId);
        if (registeredLoc != null && !registeredLoc.equals(location)) {
            reasons.add(new FraudReason(String.format("Unusual location detected: %s", location), ""));
        }

        if (fraudScore >= 0.7) {
            reasons.add(new FraudReason("Critical: Multiple fraud rules triggered simultaneously", ""));
        }

        return reasons;
    }

    public String getStatistics() {
        return "PaySim Fraud Detection System (Localised for India)\n" +
                "High Risk Threshold: > ₹50,000\n" +
                "Medium Risk Threshold: ₹30,000 - ₹50,000\n" +
                "Currency: INR (₹)";
    }
}



















//package com.example.bankingsystem.paysim;
//
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.UUID;
//import java.util.Map;
//import java.util.HashMap;
//import java.util.Set;
//import java.util.HashSet;
//
///**
// * Rule-Based Fraud Detection Service for PaySim Mobile Money Transactions
// * Based on patterns learned from 6.3M transactions with 8,213 frauds
// * Plus additional behavioral rules for real-world fraud detection
// */
//@Service
//public class PaySimFraudDetectionService {
//
//    // Track user behavior for velocity checks
//    private Map<String, Integer> userTransactionCount = new HashMap<>();
//    private Map<String, LocalDateTime> userLastTransaction = new HashMap<>();
//    private Map<String, String> userRegisteredLocation = new HashMap<>();
//    private Map<String, String> userRegisteredDevice = new HashMap<>();
//    private Map<String, List<String>> userLocationHistory = new HashMap<>();
//
//    // Track account-level behavior (NEW - for account-based fraud detection)
//    private Map<String, Set<String>> userAccounts = new HashMap<>(); // userId -> Set of accountIds
//    private Map<String, LocalDateTime> accountLastUsed = new HashMap<>(); // accountId -> last transaction time
//    private Map<String, Integer> accountTransactionCount = new HashMap<>(); // accountId -> transaction count
//    private Map<String, LocalDateTime> accountCreationDate = new HashMap<>(); // accountId -> creation date
//
//    /**
//     * Process transaction and detect fraud using rule-based logic
//     */
//    public PaySimTransactionResponse processTransaction(PaySimTransactionRequest request) {
//        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
//        LocalDateTime transactionTime = LocalDateTime.now();
//
//        // Get fields from request (for behavioral rules)
//        String userId = request.getUserId() != null ? request.getUserId() : "UNKNOWN";
//        String location = request.getLocation() != null ? request.getLocation() : "UNKNOWN";
//        String device = request.getDevice() != null ? request.getDevice() : "UNKNOWN";
//        String merchantName = request.getMerchantName() != null ? request.getMerchantName() : "UNKNOWN";
//        String senderAccountId = request.getSenderAccountId() != null ? request.getSenderAccountId() : "UNKNOWN";
//        String receiverAccountId = request.getReceiverAccountId() != null ? request.getReceiverAccountId() : "UNKNOWN";
//
//        // Calculate fraud score using rule-based logic (PaySim + Behavioral + Account-based)
//        double fraudScore = calculateFraudScore(request, userId, location, device, merchantName,
//                                               senderAccountId, receiverAccountId, transactionTime);
//        double fraudPercentage = fraudScore * 100;
//
//        // Analyze fraud reasons (including behavioral and account patterns)
//        List<FraudReason> reasons = analyzeFraudReasons(request, fraudScore, userId, location, device,
//                                                        merchantName, senderAccountId, receiverAccountId, transactionTime);
//
//        // Determine risk level and recommendation
//        String riskLevel;
//        boolean isFraud;
//        String recommendation;
//        String status;
//
//        if (fraudScore >= 0.8) {
//            riskLevel = "CRITICAL";
//            isFraud = true;
//            recommendation = "BLOCK transaction immediately and flag account for investigation";
//            status = "BLOCKED";
//        } else if (fraudScore >= 0.5) {
//            riskLevel = "HIGH";
//            isFraud = true;
//            recommendation = "HOLD transaction for manual review";
//            status = "HOLD";
//        } else if (fraudScore >= 0.3) {
//            riskLevel = "MEDIUM";
//            isFraud = false;
//            recommendation = "ALLOW with enhanced monitoring";
//            status = "APPROVED";
//        } else {
//            riskLevel = "LOW";
//            isFraud = false;
//            recommendation = "ALLOW transaction";
//            status = "APPROVED";
//        }
//
//        return new PaySimTransactionResponse(
//                transactionId,
//                fraudScore,
//                fraudPercentage,
//                isFraud,
//                riskLevel,
//                reasons,
//                recommendation,
//                transactionTime,
//                status
//        );
//    }
//
//    /**
//     * Calculate fraud score based on PaySim dataset patterns + Behavioral rules + Account-based rules
//     * Returns score between 0.0 and 1.0
//     */
//    private double calculateFraudScore(PaySimTransactionRequest request, String userId,
//                                      String location, String device, String merchantName,
//                                      String senderAccountId, String receiverAccountId,
//                                      LocalDateTime transactionTime) {
//        double score = 0.0;
//
//        String type = request.getType().toUpperCase();
//        double amount = request.getAmount();
//        double oldBalOrg = request.getOldbalanceOrg();
//        double newBalOrg = request.getNewbalanceOrig();
//        double oldBalDest = request.getOldbalanceDest();
//        double newBalDest = request.getNewbalanceDest();
//
//        // ========== PAYSIM PATTERN RULES (10 rules) ==========
//
//        // RULE 1: Transaction Type (STRONGEST INDICATOR)
//        if (type.equals("TRANSFER")) {
//            score += 0.35;
//        } else if (type.equals("CASH_OUT")) {
//            score += 0.30;
//        }
//
//        // RULE 2: Account Emptying (97.6% of frauds)
//        if (newBalOrg == 0 && oldBalOrg > 0) {
//            score += 0.40;
//        }
//
//        // RULE 3: High Transaction Amount
//        if (amount > 1000000) {
//            score += 0.25;
//        } else if (amount > 500000) {
//            score += 0.20;
//        } else if (amount > 200000) {
//            score += 0.15;
//        } else if (amount > 100000) {
//            score += 0.10;
//        }
//
//        // RULE 4: Balance Inconsistency (Sender)
//        double balanceDiffOrg = oldBalOrg - newBalOrg - amount;
//        if (Math.abs(balanceDiffOrg) > 0.01) {
//            score += 0.20;
//        }
//
//        // RULE 5: Balance Inconsistency (Receiver)
//        double balanceDiffDest = newBalDest - oldBalDest - amount;
//        if (Math.abs(balanceDiffDest) > 0.01) {
//            score += 0.15;
//        }
//
//        // RULE 6: Mule Account Detection
//        if (oldBalDest == 0 && newBalDest > 0) {
//            score += 0.15;
//        }
//
//        // RULE 7: Amount Exceeds Balance
//        if (amount > oldBalOrg && oldBalOrg > 0) {
//            score += 0.30;
//        }
//
//        // RULE 8: Round Amount Pattern
//        if (amount % 10000 == 0 && amount >= 50000) {
//            score += 0.10;
//        }
//
//        // RULE 9: Complete Balance Transfer
//        if (amount == oldBalOrg && oldBalOrg > 0 && newBalOrg == 0) {
//            score += 0.25;
//        }
//
//        // RULE 10: Large Amount to Empty Account
//        if (amount > 100000 && oldBalDest == 0) {
//            score += 0.20;
//        }
//
//        // ========== BEHAVIORAL RULES (NEW - 8 rules) ==========
//
//        // RULE 11: Transaction Velocity (Rapid transactions)
//        userTransactionCount.put(userId, userTransactionCount.getOrDefault(userId, 0) + 1);
//        int txCount = userTransactionCount.get(userId);
//
//        if (txCount > 10) {
//            score += 0.25; // Very high frequency
//        } else if (txCount > 5) {
//            score += 0.15; // High frequency
//        }
//
//        // RULE 12: Rapid Transaction Timing
//        LocalDateTime lastTx = userLastTransaction.get(userId);
//        if (lastTx != null) {
//            long minutesBetween = java.time.Duration.between(lastTx, transactionTime).toMinutes();
//            if (minutesBetween < 1) {
//                score += 0.30; // Less than 1 minute apart
//            } else if (minutesBetween < 5) {
//                score += 0.20; // Less than 5 minutes apart
//            }
//        }
//        userLastTransaction.put(userId, transactionTime);
//
//        // RULE 13: Location Change Detection
//        String registeredLoc = userRegisteredLocation.get(userId);
//        if (registeredLoc == null) {
//            userRegisteredLocation.put(userId, location);
//        } else if (!registeredLoc.equals(location)) {
//            score += 0.20; // Transaction from different location
//        }
//
//        // RULE 14: Multiple Location Pattern
//        List<String> locHistory = userLocationHistory.getOrDefault(userId, new ArrayList<>());
//        locHistory.add(location);
//        userLocationHistory.put(userId, locHistory);
//
//        // Check if user is transacting from many different locations
//        Set<String> uniqueLocations = new HashSet<>(locHistory);
//        if (uniqueLocations.size() > 3) {
//            score += 0.15; // Transactions from 4+ different locations
//        }
//
//        // RULE 15: Device Change Detection
//        String registeredDev = userRegisteredDevice.get(userId);
//        if (registeredDev == null) {
//            userRegisteredDevice.put(userId, device);
//        } else if (!registeredDev.equals(device)) {
//            score += 0.20; // Transaction from different device
//        }
//
//        // RULE 16: Suspicious Merchant Names
//        String merchantLower = merchantName.toLowerCase();
//        if (merchantLower.contains("anonymous") ||
//            merchantLower.contains("unknown") ||
//            merchantLower.contains("suspicious") ||
//            merchantLower.contains("test")) {
//            score += 0.25; // Suspicious merchant
//        }
//
//        // RULE 17: Unusual Transaction Time
//        int hour = transactionTime.getHour();
//        if (hour >= 0 && hour <= 4) {
//            score += 0.15; // Midnight to 4 AM (unusual time)
//        }
//
//        // RULE 18: Weekend + High Amount
//        int dayOfWeek = transactionTime.getDayOfWeek().getValue();
//        if ((dayOfWeek == 6 || dayOfWeek == 7) && amount > 200000) {
//            score += 0.10; // Large transaction on weekend
//        }
//
//        // ========== ACCOUNT-BASED RULES (NEW - 4 rules) ==========
//
//        // RULE 19: Account Hopping (Multiple accounts in short time)
//        Set<String> accounts = userAccounts.getOrDefault(userId, new HashSet<>());
//        accounts.add(senderAccountId);
//        userAccounts.put(userId, accounts);
//
//        if (accounts.size() > 2) {
//            // Check if multiple accounts used recently
//            score += 0.30; // User trying multiple accounts
//        }
//
//        // RULE 20: Dormant Account Activation
//        LocalDateTime lastUsed = accountLastUsed.get(senderAccountId);
//        if (lastUsed != null) {
//            long daysSinceLastUse = java.time.Duration.between(lastUsed, transactionTime).toDays();
//            if (daysSinceLastUse > 90 && amount > 50000) {
//                score += 0.25; // Dormant account suddenly active with large amount
//            }
//        }
//        accountLastUsed.put(senderAccountId, transactionTime);
//
//        // RULE 21: New Account Large Transaction
//        LocalDateTime creationDate = accountCreationDate.get(senderAccountId);
//        if (creationDate == null) {
//            // First time seeing this account, assume it's new
//            accountCreationDate.put(senderAccountId, transactionTime);
//
//            // Check if first transaction is large
//            if (amount > 100000) {
//                score += 0.30; // New account with large first transaction
//            }
//        } else {
//            long accountAge = java.time.Duration.between(creationDate, transactionTime).toDays();
//            if (accountAge < 7 && amount > 100000) {
//                score += 0.30; // Account less than 7 days old with large transaction
//            }
//        }
//
//        // RULE 22: Suspicious Account ID Pattern
//        String senderLower = senderAccountId.toLowerCase();
//        String receiverLower = receiverAccountId.toLowerCase();
//
//        if (senderLower.contains("mule") || senderLower.contains("test") ||
//            senderLower.contains("temp") || senderLower.matches("acc0+\\d+")) {
//            score += 0.20; // Suspicious sender account ID
//        }
//
//        if (receiverLower.contains("mule") || receiverLower.contains("test") ||
//            receiverLower.contains("temp") || receiverLower.matches("acc0+\\d+")) {
//            score += 0.20; // Suspicious receiver account ID
//        }
//
//        // Normalize score to 0-1 range (cap at 1.0)
//        return Math.min(score, 1.0);
//    }
//
//    /**
//     * Analyze and generate detailed fraud reasons (PaySim patterns + Behavioral rules + Account-based rules)
//     */
//    private List<FraudReason> analyzeFraudReasons(PaySimTransactionRequest request, double fraudScore,
//                                                  String userId, String location, String device,
//                                                  String merchantName, String senderAccountId,
//                                                  String receiverAccountId, LocalDateTime transactionTime) {
//        List<FraudReason> reasons = new ArrayList<>();
//
//        String type = request.getType().toUpperCase();
//        double amount = request.getAmount();
//        double oldBalOrg = request.getOldbalanceOrg();
//        double newBalOrg = request.getNewbalanceOrig();
//        double oldBalDest = request.getOldbalanceDest();
//        double newBalDest = request.getNewbalanceDest();
//
//        // Calculate balance differences
//        double balanceDiffOrg = oldBalOrg - newBalOrg - amount;
//        double balanceDiffDest = newBalDest - oldBalDest - amount;
//
//        // ========== PAYSIM PATTERN REASONS ==========
//
//        // Reason 1: High transaction amount
//        if (amount > 1000000) {
//            reasons.add(new FraudReason(
//                    String.format("Very high transaction amount: $%.2f (avg fraud: $1.47M)", amount),
//                    ""
//            ));
//        } else if (amount > 500000) {
//            reasons.add(new FraudReason(
//                    String.format("High transaction amount: $%.2f", amount),
//                    ""
//            ));
//        } else if (amount > 200000) {
//            reasons.add(new FraudReason(
//                    String.format("Above average fraud amount: $%.2f", amount),
//                    ""
//            ));
//        }
//
//        // Reason 2: Balance inconsistency (sender)
//        if (Math.abs(balanceDiffOrg) > 0.01) {
//            reasons.add(new FraudReason(
//                    String.format("Sender balance inconsistency detected (diff: $%.2f)", Math.abs(balanceDiffOrg)),
//                    ""
//            ));
//        }
//
//        // Reason 3: Balance inconsistency (receiver)
//        if (Math.abs(balanceDiffDest) > 0.01) {
//            reasons.add(new FraudReason(
//                    String.format("Receiver balance inconsistency detected (diff: $%.2f)", Math.abs(balanceDiffDest)),
//                    ""
//            ));
//        }
//
//        // Reason 4: Account emptying (STRONGEST PATTERN)
//        if (newBalOrg == 0 && oldBalOrg > 0) {
//            reasons.add(new FraudReason(
//                    "Sender account emptied completely (97.6% of frauds show this pattern)",
//                    ""
//            ));
//        }
//
//        // Reason 5: Mule account
//        if (oldBalDest == 0 && newBalDest > 0) {
//            reasons.add(new FraudReason(
//                    "Receiver account was empty (potential mule account - 15.5% of frauds)",
//                    ""
//            ));
//        }
//
//        // Reason 6: Transaction type risk
//        if (type.equals("TRANSFER")) {
//            reasons.add(new FraudReason(
//                    "High-risk transaction type: TRANSFER (0.769% fraud rate, 4,097 frauds)",
//                    ""
//            ));
//        } else if (type.equals("CASH_OUT")) {
//            reasons.add(new FraudReason(
//                    "High-risk transaction type: CASH_OUT (0.184% fraud rate, 4,116 frauds)",
//                    ""
//            ));
//        }
//
//        // Reason 7: Amount exceeds balance
//        if (amount > oldBalOrg && oldBalOrg > 0) {
//            reasons.add(new FraudReason(
//                    String.format("Transaction amount ($%.2f) exceeds sender balance ($%.2f)", amount, oldBalOrg),
//                    ""
//            ));
//        }
//
//        // Reason 8: Round amount pattern
//        if (amount % 10000 == 0 && amount >= 50000) {
//            reasons.add(new FraudReason(
//                    String.format("Round amount transaction: $%.2f (potential money laundering)", amount),
//                    ""
//            ));
//        }
//
//        // Reason 9: Complete balance transfer
//        if (amount == oldBalOrg && oldBalOrg > 0 && newBalOrg == 0) {
//            reasons.add(new FraudReason(
//                    "Transferring entire account balance",
//                    ""
//            ));
//        }
//
//        // ========== BEHAVIORAL PATTERN REASONS ==========
//
//        // Reason 11: Transaction Velocity
//        int txCount = userTransactionCount.getOrDefault(userId, 0);
//        if (txCount > 10) {
//            reasons.add(new FraudReason(
//                    String.format("Very high transaction frequency: %d transactions from this user", txCount),
//                    ""
//            ));
//        } else if (txCount > 5) {
//            reasons.add(new FraudReason(
//                    String.format("High transaction frequency: %d transactions from this user", txCount),
//                    ""
//            ));
//        }
//
//        // Reason 12: Rapid Transaction Timing
//        LocalDateTime lastTx = userLastTransaction.get(userId);
//        if (lastTx != null) {
//            long minutesBetween = java.time.Duration.between(lastTx, transactionTime).toMinutes();
//            if (minutesBetween < 1) {
//                reasons.add(new FraudReason(
//                        "Rapid transactions: Less than 1 minute since last transaction",
//                        ""
//                ));
//            } else if (minutesBetween < 5) {
//                reasons.add(new FraudReason(
//                        String.format("Rapid transactions: Only %d minutes since last transaction", minutesBetween),
//                        ""
//                ));
//            }
//        }
//
//        // Reason 13: Location Change Detection
//        String registeredLoc = userRegisteredLocation.get(userId);
//        if (registeredLoc != null && !registeredLoc.equals(location)) {
//            reasons.add(new FraudReason(
//                    String.format("Transaction from different location: %s (registered: %s)", location, registeredLoc),
//                    ""
//            ));
//        }
//
//        // Reason 14: Multiple Location Pattern
//        List<String> locHistory = userLocationHistory.get(userId);
//        if (locHistory != null) {
//            Set<String> uniqueLocations = new HashSet<>(locHistory);
//            if (uniqueLocations.size() > 3) {
//                reasons.add(new FraudReason(
//                        String.format("Transactions from multiple locations: %d different locations detected", uniqueLocations.size()),
//                        ""
//                ));
//            }
//        }
//
//        // Reason 15: Device Change Detection
//        String registeredDev = userRegisteredDevice.get(userId);
//        if (registeredDev != null && !registeredDev.equals(device)) {
//            reasons.add(new FraudReason(
//                    String.format("Transaction from different device: %s (registered: %s)", device, registeredDev),
//                    ""
//            ));
//        }
//
//        // Reason 16: Suspicious Merchant Names
//        String merchantLower = merchantName.toLowerCase();
//        if (merchantLower.contains("anonymous") ||
//            merchantLower.contains("unknown") ||
//            merchantLower.contains("suspicious") ||
//            merchantLower.contains("test")) {
//            reasons.add(new FraudReason(
//                    String.format("Suspicious merchant name detected: %s", merchantName),
//                    ""
//            ));
//        }
//
//        // Reason 17: Unusual Transaction Time
//        int hour = transactionTime.getHour();
//        if (hour >= 0 && hour <= 4) {
//            reasons.add(new FraudReason(
//                    String.format("Unusual transaction time: %02d:00 (midnight to 4 AM)", hour),
//                    ""
//            ));
//        }
//
//        // Reason 18: Weekend + High Amount
//        int dayOfWeek = transactionTime.getDayOfWeek().getValue();
//        if ((dayOfWeek == 6 || dayOfWeek == 7) && amount > 200000) {
//            String day = dayOfWeek == 6 ? "Saturday" : "Sunday";
//            reasons.add(new FraudReason(
//                    String.format("Large transaction on weekend: $%.2f on %s", amount, day),
//                    ""
//            ));
//        }
//
//        // ========== ACCOUNT-BASED PATTERN REASONS (NEW) ==========
//
//        // Reason 19: Account Hopping
//        Set<String> accounts = userAccounts.get(userId);
//        if (accounts != null && accounts.size() > 2) {
//            reasons.add(new FraudReason(
//                    String.format("Account hopping detected: User has used %d different accounts", accounts.size()),
//                    ""
//            ));
//        }
//
//        // Reason 20: Dormant Account Activation
//        LocalDateTime lastUsed = accountLastUsed.get(senderAccountId);
//        if (lastUsed != null) {
//            long daysSinceLastUse = java.time.Duration.between(lastUsed, transactionTime).toDays();
//            if (daysSinceLastUse > 90 && amount > 50000) {
//                reasons.add(new FraudReason(
//                        String.format("Dormant account activated: Account inactive for %d days with large transaction", daysSinceLastUse),
//                        ""
//                ));
//            }
//        }
//
//        // Reason 21: New Account Large Transaction
//        LocalDateTime creationDate = accountCreationDate.get(senderAccountId);
//        if (creationDate != null) {
//            long accountAge = java.time.Duration.between(creationDate, transactionTime).toDays();
//            if (accountAge < 7 && amount > 100000) {
//                reasons.add(new FraudReason(
//                        String.format("New account with large transaction: Account is only %d days old", accountAge),
//                        ""
//                ));
//            }
//        } else if (amount > 100000) {
//            reasons.add(new FraudReason(
//                    "First transaction from this account is unusually large",
//                    ""
//            ));
//        }
//
//        // Reason 22: Suspicious Account ID Pattern
//        String senderLower = senderAccountId.toLowerCase();
//        String receiverLower = receiverAccountId.toLowerCase();
//
//        if (senderLower.contains("mule") || senderLower.contains("test") ||
//            senderLower.contains("temp") || senderLower.matches("acc0+\\d+")) {
//            reasons.add(new FraudReason(
//                    String.format("Suspicious sender account ID pattern: %s", senderAccountId),
//                    ""
//            ));
//        }
//
//        if (receiverLower.contains("mule") || receiverLower.contains("test") ||
//            receiverLower.contains("temp") || receiverLower.matches("acc0+\\d+")) {
//            reasons.add(new FraudReason(
//                    String.format("Suspicious receiver account ID pattern: %s", receiverAccountId),
//                    ""
//            ));
//        }
//
//        // Reason 10: High fraud score from rules
//        if (fraudScore > 0.8) {
//            reasons.add(new FraudReason(
//                    String.format("Rule-based system detected high fraud probability: %.1f%%", fraudScore * 100),
//                    ""
//            ));
//        } else if (fraudScore > 0.5) {
//            reasons.add(new FraudReason(
//                    String.format("Rule-based system detected elevated fraud risk: %.1f%%", fraudScore * 100),
//                    ""
//            ));
//        }
//
//        // If no specific reasons but fraud score is moderate
//        if (reasons.isEmpty() && fraudScore > 0.3) {
//            reasons.add(new FraudReason(
//                    "Transaction pattern matches known fraud signatures",
//                    ""
//            ));
//        }
//
//        return reasons;
//    }
//
//    /**
//     * Get fraud detection statistics
//     */
//    public String getStatistics() {
//        return "PaySim Fraud Detection System\n" +
//                "Dataset: 6.3M transactions, 8,213 frauds (0.129%)\n" +
//                "Key Patterns:\n" +
//                "- 100% of frauds are TRANSFER or CASH_OUT\n" +
//                "- 97.6% of frauds empty sender account\n" +
//                "- Fraud avg amount: $1.47M vs Normal: $178k\n" +
//                "- 15.5% of frauds go to zero-balance accounts";
//    }
//}
