package com.example.demo;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FraudService {

    private final TransactionRepository repo;

    public FraudService(TransactionRepository repo) {
        this.repo = repo;
    }

    public Transaction processTransaction(Transaction txn) {
        int riskScore = 0;
        StringBuilder reasons = new StringBuilder();

        // Amount Rule (> 75,000)
        if (txn.getAmount() > 75000) {
            riskScore += 40;
            reasons.append("High Amount; ");
        }

        // Frequency Check (More than 2 txns in 1 minute)
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        long recentTxns = repo.countRecentTransactions(txn.getSenderId(), oneMinuteAgo);
        if (recentTxns >= 2) {
            riskScore += 50;
            reasons.append("High Velocity (Frequency); ");
        }

        // Late Night Rule (1 AM to 5 AM)
        int hour = LocalDateTime.now().getHour();
        if (hour >= 1 && hour <= 5) {
            riskScore += 30;
            reasons.append("Late Night Activity; ");
        }

        // International/Specific Location Rule
        if (txn.getSenderLocation() != null &&
                (txn.getSenderLocation().equalsIgnoreCase("Singapore") || txn.getSenderLocation().equalsIgnoreCase("New York"))) {
            riskScore += 30;
            reasons.append("International Location; ");
        }

        // Auth & Device Rules
        if ("NONE".equalsIgnoreCase(txn.getAuthType())) {
            riskScore += 40;
            reasons.append("No Authentication; ");
        }
        if (txn.getSenderDevice() != null && txn.getSenderDevice().contains("Web")) {
            riskScore += 10;
        }

        // Location Mismatch (Sender vs Receiver)
        if (txn.getSenderLocation() != null && !txn.getSenderLocation().equalsIgnoreCase(txn.getReceiverLocation())) {
            riskScore += 20;
            reasons.append("Location Mismatch; ");
        }

        // Final Decision Logic
        String status;
        if (riskScore >= 80) {
            status = "FRAUD-BLOCKED";
        } else if (riskScore >= 50) {
            status = "FLAGGED";
        } else if (riskScore >= 30) {
            status = "SUSPICIOUS";
        } else {
            status = "SUCCESS";
            reasons.append("Verified Transaction");
        }

        txn.setRiskScore(riskScore);
        txn.setStatus(status);
        txn.setFailureReason(reasons.toString());

        // Update Balance Logic (Assuming initial balance is provided in Request)
        if (!status.equals("FRAUD-BLOCKED")) {
            if ("Debit".equalsIgnoreCase(txn.getTransactionType())) {
                txn.setBalance(txn.getBalance() - txn.getAmount());
            } else {
                txn.setBalance(txn.getBalance() + txn.getAmount());
            }
        }

        return repo.save(txn);
    }

    public List<Transaction> getAllTransactions() {
        return repo.findAll();
    }
}