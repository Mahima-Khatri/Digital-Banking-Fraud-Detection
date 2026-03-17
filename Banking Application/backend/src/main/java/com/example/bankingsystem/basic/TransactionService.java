package com.example.bankingsystem.basic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    private double balance = 100000; // In a real app, this would be per user
    private Map<String, Integer> transactionFrequency = new HashMap<>();
    private String registeredLocation = "Mumbai";
    private String registeredDevice = "DEV001";

    public Transaction processTransaction(TransactionRequest request) {
        String transactionId = "TXN" + (10000 + (int)(Math.random() * 90000));
        String userId = request.getUserId();
        String transactionType = request.getTransactionType();
        String senderAccount = request.getSenderAccount();
        String receiverAccount = request.getReceiverAccount();
        String location = request.getLocation();
        String device = request.getDevice();
        double amount = request.getAmount();

        int fraudScore = calculateFraudScore(userId, transactionType, location, device, amount);

        String status;
        if (fraudScore >= 60) {
            status = "HIGH RISK - BLOCKED";
        } else if (fraudScore >= 30) {
            status = "SUSPICIOUS - ALLOWED";
            updateBalance(transactionType, amount);
        } else {
            status = "SAFE - APPROVED";
            updateBalance(transactionType, amount);
        }

        Transaction transaction = new Transaction(transactionId, userId, transactionType,
                senderAccount, receiverAccount, location, amount, status, fraudScore, LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    private int calculateFraudScore(String userId, String transactionType, String location, String device, double amount) {
        int fraudScore = 0;

        transactionFrequency.put(userId, transactionFrequency.getOrDefault(userId, 0) + 1);

        if (amount > 90000) fraudScore += 50;
        else if (amount > 75000) fraudScore += 30;

        if (transactionFrequency.get(userId) > 5) fraudScore += 25;

        if (!location.equals(registeredLocation)) fraudScore += 20;

        if (!device.equals(registeredDevice)) fraudScore += 20;

        if (transactionType.equals("DEBIT") && amount > balance) fraudScore += 40;

        return fraudScore;
    }

    private void updateBalance(String transactionType, double amount) {
        if (transactionType.equals("DEBIT")) {
            balance -= amount;
        } else {
            balance += amount;
        }
    }

    public double getBalance() {
        return balance;
    }
}