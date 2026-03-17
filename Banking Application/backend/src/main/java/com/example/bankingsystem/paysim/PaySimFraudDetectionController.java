package com.example.bankingsystem.paysim;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for PaySim Fraud Detection API
 */
@RestController
@RequestMapping("/api/paysim")
@CrossOrigin(origins = "*")
public class PaySimFraudDetectionController {

    @Autowired
    private PaySimFraudDetectionService fraudDetectionService;

    /**
     * Home endpoint
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "PaySim Fraud Detection API");
        response.put("version", "1.0");
        response.put("model", "Rule-Based Detection");
        response.put("status", "Running");
        response.put("endpoints", Map.of(
                "POST /api/paysim/predict", "Fraud prediction",
                "GET /api/paysim/health", "Health check",
                "GET /api/paysim/statistics", "Fraud detection statistics"
        ));
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "PaySim Fraud Detection");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * Fraud prediction endpoint
     */
    @PostMapping("/predict")
    public ResponseEntity<?> predictFraud(@Valid @RequestBody PaySimTransactionRequest request) {
        try {
            PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Prediction error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get fraud detection statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("dataset", "PaySim Mobile Money");
        stats.put("total_transactions", "6,362,620");
        stats.put("fraud_cases", "8,213");
        stats.put("fraud_rate", "0.129%");
        stats.put("patterns", Map.of(
                "transaction_types", "100% frauds are TRANSFER or CASH_OUT",
                "account_emptying", "97.6% of frauds empty sender account",
                "high_amounts", "Fraud avg: $1.47M, Normal avg: $178k",
                "mule_accounts", "15.5% of frauds go to zero-balance accounts"
        ));
        stats.put("rules", Map.of(
                "rule_1", "Transaction type (TRANSFER/CASH_OUT = high risk)",
                "rule_2", "Account emptying (newBalance = 0)",
                "rule_3", "High transaction amounts (>$200k)",
                "rule_4", "Balance inconsistencies",
                "rule_5", "Mule account detection (zero balance receivers)",
                "rule_6", "Amount exceeds balance",
                "rule_7", "Round amount patterns",
                "rule_8", "Complete balance transfers"
        ));
        return ResponseEntity.ok(stats);
    }

    /**
     * Test endpoint with sample data
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test endpoint");
        response.put("sample_request", Map.of(
                "type", "TRANSFER",
                "amount", 50000.0,
                "oldbalanceOrg", 100000.0,
                "newbalanceOrig", 50000.0,
                "oldbalanceDest", 20000.0,
                "newbalanceDest", 70000.0
        ));
        response.put("instructions", "Send POST request to /api/paysim/predict with the sample request");
        return ResponseEntity.ok(response);
    }
}
