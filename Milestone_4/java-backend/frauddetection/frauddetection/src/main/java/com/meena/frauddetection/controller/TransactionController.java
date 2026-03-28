package com.meena.frauddetection.controller;

import com.meena.frauddetection.model.PaymentTransaction;
import com.meena.frauddetection.service.EmailService;
import com.meena.frauddetection.service.PerformanceTracker;
import com.meena.frauddetection.service.TransactionService;
import com.meena.frauddetection.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final EmailService emailService;

    @Value("${app.fraud.alert-recipient:fraudalerts123@gmail.com}")
    private String alertRecipient;

    private static boolean isEmailAlertEnabled = true;

    public TransactionController(TransactionRepository transactionRepository, 
                                 TransactionService transactionService,
                                 EmailService emailService) {
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
        this.emailService = emailService;
    }

    @PostMapping("/settings/email-alerts")
    public boolean toggleEmailAlerts(@RequestParam("enabled") boolean enabled) {
        isEmailAlertEnabled = enabled;
        System.out.println(">>> Email Alerts setting updated to: " + isEmailAlertEnabled);
        return isEmailAlertEnabled;
    }

    @GetMapping("/settings/email-alerts")
    public boolean getEmailAlertsStatus() {
        return isEmailAlertEnabled;
    }

    @PostMapping
    public PaymentTransaction createTransaction(@RequestBody PaymentTransaction transaction) {
        PaymentTransaction processedTx = transactionService.processTransaction(transaction);
        checkAndSendAlert(processedTx);
        return processedTx;
    }

    @PostMapping("/batch")
    public List<PaymentTransaction> createBatch(@RequestBody List<PaymentTransaction> transactions) {
        List<PaymentTransaction> results = new ArrayList<>();
        for (PaymentTransaction tx : transactions) {
            PaymentTransaction processedTx = transactionService.processTransaction(tx);
            checkAndSendAlert(processedTx);
            results.add(processedTx);
        }
        return results;
    }

    private void checkAndSendAlert(PaymentTransaction tx) {
        if (!isEmailAlertEnabled) return;
        
        String risk = tx.getRiskLevel();
        if (risk != null && (risk.equalsIgnoreCase("HIGH") || risk.equalsIgnoreCase("MEDIUM"))) {
            // ⏱️ Start timing for email dispatch telemetry
            long emailStartTime = System.currentTimeMillis();
            
            emailService.sendFraudAlert(
                alertRecipient, 
                tx.getTransactionId(), 
                tx.getAmount(), 
                risk
            );

            // ⏱️ Record email dispatch latency
            long emailElapsed = System.currentTimeMillis() - emailStartTime;
            PerformanceTracker.recordEmailLatency(emailElapsed);
            System.out.println("⏱️ Alert dispatch latency: " + emailElapsed + " ms");
        } else {
            // Record 0 if no alert was sent to keep averages accurate for "no-action" paths
            // Or skip depending on how you want to visualize "Alert Dispatch Time"
            // For now, we only record when an actual dispatch happens.
        }
    }

    @GetMapping
    public List<PaymentTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @PostMapping("/generate")
    public List<PaymentTransaction> generateSyntheticTransactions(@RequestParam(value = "count", defaultValue = "1") int count) {
        List<PaymentTransaction> syntheticBatch = new ArrayList<>();
        Random random = new Random();
        
        // Match the frontend's cities and coordinates
        String[][] locations = {
            {"Mumbai", "India", "19.07", "72.87"},
            {"Delhi", "India", "28.61", "77.20"},
            {"Bangalore", "India", "12.97", "77.59"},
            {"New York", "USA", "40.71", "-74.00"},
            {"London", "United Kingdom", "51.50", "-0.12"},
            {"Singapore", "Singapore", "1.35", "103.81"},
            {"Moscow", "Russia", "55.75", "37.61"},
            {"Sao Paulo", "Brazil", "-23.55", "-46.63"},
            {"Berlin", "Germany", "52.52", "13.40"}
        };
        
        String[] modes = {"UPI", "IMPS", "NEFT", "RTGS"};

        SimpleDateFormat timeFormat = new SimpleDateFormat("hh:mm a");

        for (int i = 0; i < count; i++) {
            PaymentTransaction mockTx = new PaymentTransaction();
            mockTx.setTransactionId("TXN-AUTO-" + System.currentTimeMillis() + "-" + i);
            
            String[] loc = locations[random.nextInt(locations.length)];
            boolean isInternational = !loc[1].equals("India");
            boolean forceFraud = isInternational ? random.nextDouble() < 0.6 : random.nextDouble() < 0.15;
            
            mockTx.setSenderLocation(forceFraud && isInternational ? "International / Proxy" : loc[0]);
            mockTx.setCountry(loc[1]);
            mockTx.setLatitude(Double.parseDouble(loc[2]) + (random.nextDouble() - 0.5));
            mockTx.setLongitude(Double.parseDouble(loc[3]) + (random.nextDouble() - 0.5));
            
            mockTx.setTransactionMode(isInternational ? "RTGS" : modes[random.nextInt(modes.length)]);
            mockTx.setTransactionType(random.nextDouble() > 0.5 ? "Credit" : "Debit");
            
            // Generate amounts triggering rules: >50k (high risk), >20k (med risk)
            if (forceFraud) {
                mockTx.setAmount(51000.0 + random.nextInt(40000));
                mockTx.setSenderDevice("Unrecognized VPN");
                // Maybe suspicious time
                if (random.nextDouble() > 0.5) {
                    mockTx.setTransactionTime("02:30 AM");
                } else {
                    mockTx.setTransactionTime(timeFormat.format(new Date()));
                }
            } else {
                mockTx.setAmount(100.0 + random.nextInt(19000));
                mockTx.setSenderDevice("Authorized Device");
                mockTx.setTransactionTime(timeFormat.format(new Date()));
            }

            mockTx.setSenderId("USR-" + (1000 + random.nextInt(9000)));
            mockTx.setSenderAccount("ACC" + (1000000000L + (long)(random.nextDouble() * 9000000000L)));
            mockTx.setSenderMobile("9" + (100000000L + (long)(random.nextDouble() * 899999999L)));
            
            mockTx.setReceiverId("USR-" + (1000 + random.nextInt(9000)));
            mockTx.setReceiverAccount("ACC" + (1000000000L + (long)(random.nextDouble() * 9000000000L)));
            mockTx.setReceiverLocation(locations[random.nextInt(locations.length)][0]);
            mockTx.setAuthType("OTP");

            PaymentTransaction savedTx = transactionService.processTransaction(mockTx);
            checkAndSendAlert(savedTx);
            syntheticBatch.add(savedTx);
        }

        return syntheticBatch;
    }
    @DeleteMapping
    public void deleteAllTransactions() {
        transactionRepository.deleteAll();
    }
}
