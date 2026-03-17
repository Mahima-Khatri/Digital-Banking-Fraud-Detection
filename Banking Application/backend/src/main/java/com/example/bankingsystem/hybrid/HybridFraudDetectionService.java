package com.example.bankingsystem.hybrid;

import com.example.bankingsystem.paysim.PaySimFraudDetectionService;
import com.example.bankingsystem.paysim.PaySimTransactionRequest;
import com.example.bankingsystem.paysim.PaySimTransactionResponse;
import com.example.bankingsystem.alert.Alert;
import com.example.bankingsystem.alert.AlertRepository;
import com.example.bankingsystem.analyst.AnalystService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class HybridFraudDetectionService {

    @Autowired
    private PaySimFraudDetectionService paySimService;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AnalystService analystService;

    @Autowired
    private JavaMailSender mailSender;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String FASTAPI_URL = "http://127.0.0.1:8000/predict";

    private int totalTransactions = 0;
    private int lowRiskCount = 0;
    private int mediumRiskCount = 0;
    private int highRiskCount = 0;

    public HybridFraudDetectionResponse processHybridTransaction(HybridTransactionRequest request) {
        String transactionId = "HYB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        LocalDateTime transactionTime = LocalDateTime.now();

        PaySimTransactionResponse paySimResponse = getRuleBasedResponse(request);
        double ruleBasedScore = paySimResponse.getFraudScore();
        List<com.example.bankingsystem.paysim.FraudReason> fraudReasons = paySimResponse.getReasons();

        double mlScore = getMLScore(request);
        double combinedScore = combineScores(mlScore, ruleBasedScore);
        double combinedPercentage = combinedScore * 100;

        String riskLevel;
        boolean isFraud;
        String recommendation;
        String status;

        if (combinedScore >= 0.6) {
            riskLevel = "HIGH";
            isFraud = true;
            recommendation = "BLOCK transaction immediately";
            status = "BLOCKED";
            highRiskCount++;
        } else if (combinedScore >= 0.3) {
            riskLevel = "MEDIUM";
            isFraud = false;
            recommendation = "HOLD transaction for manual review";
            status = "HOLD";
            mediumRiskCount++;
        } else {
            riskLevel = "LOW";
            isFraud = false;
            recommendation = "ALLOW transaction";
            status = "APPROVED";
            lowRiskCount++;
        }

        totalTransactions++;

        saveToDatabase(request, transactionId, mlScore, ruleBasedScore, combinedScore,
                riskLevel, status, fraudReasons, recommendation, transactionTime);

        // TRIGGER ALERT & EMAIL for both HIGH and MEDIUM RISK
        if ("HIGH".equals(riskLevel) || "MEDIUM".equals(riskLevel)) {
            createAlert(transactionId, request, combinedScore, fraudReasons, riskLevel);
        }

        try {
            analystService.updateUserRiskProfile(request.getUserId(), BigDecimal.valueOf(request.getAmount()), riskLevel, request.getLocation(), request.getDevice());
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
        }

        return new HybridFraudDetectionResponse(transactionId, mlScore, ruleBasedScore, combinedScore, combinedPercentage, isFraud, riskLevel, recommendation, status, fraudReasons, transactionTime);
    }

    private double getMLScore(HybridTransactionRequest request) {
        try {
            Map<String, Object> fastApiRequest = new HashMap<>();
            fastApiRequest.put("type", request.getType());
            fastApiRequest.put("amount", request.getAmount());
            fastApiRequest.put("oldbalanceOrg", request.getOldbalanceOrg());
            fastApiRequest.put("newbalanceOrig", request.getNewbalanceOrig());
            fastApiRequest.put("oldbalanceDest", request.getOldbalanceDest());
            fastApiRequest.put("newbalanceDest", request.getNewbalanceDest());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(fastApiRequest, headers);

            ResponseEntity<Map> response = restTemplate.exchange(FASTAPI_URL, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object fraudScore = response.getBody().get("fraud_score");
                if (fraudScore instanceof Number) return ((Number) fraudScore).doubleValue();
            }
        } catch (Exception e) {
            System.err.println("FastAPI offline: " + e.getMessage());
        }
        return 0.0;
    }

    private double combineScores(double mlScore, double ruleBasedScore) {
        return (mlScore * 0.6) + (ruleBasedScore * 0.4);
    }

    private void createAlert(String transactionId, HybridTransactionRequest request,
                             double combinedScore, List<com.example.bankingsystem.paysim.FraudReason> fraudReasons, String riskLevel) {
        try {
            Alert alert = new Alert();
            alert.setTransactionId(transactionId);
            alert.setAlertType(riskLevel + "_RISK_TRANSACTION");
            alert.setSeverity(riskLevel);

            StringBuilder messageBody = new StringBuilder();
            String subjectPrefix;

            if ("HIGH".equals(riskLevel)) {
                subjectPrefix = "🚨 CRITICAL: Fraud Detected - ";
                messageBody.append("HIGH RISK TRANSACTION DETECTED!\n");
                messageBody.append("STATUS: IMMEDIATELY BLOCKED\n");
            } else {
                subjectPrefix = "⚠️ REVIEW: Transaction on Hold - ";
                messageBody.append("MEDIUM RISK TRANSACTION DETECTED!\n");
                messageBody.append("STATUS: PENDING MANUAL REVIEW\n");
            }

            messageBody.append("Amount: ₹").append(String.format("%.2f", request.getAmount())).append("\n");
            messageBody.append("User: ").append(request.getUserId()).append("\n");
            messageBody.append("Score: ").append(String.format("%.2f%%", combinedScore * 100)).append("\n");
            messageBody.append("Reasons: ");

            for (int i = 0; i < Math.min(3, fraudReasons.size()); i++) {
                String reasonWithRupee = fraudReasons.get(i).getReason().replace("$", "₹");
                messageBody.append(reasonWithRupee).append(", ");
            }

            if ("MEDIUM".equals(riskLevel)) {
                messageBody.append("\n\nNote: This transaction shows unusual patterns. Verify with the customer before releasing.");
            }

            alert.setMessage(messageBody.toString());
            alertRepository.save(alert);

            sendEmail(transactionId, messageBody.toString(), subjectPrefix + transactionId);

        } catch (Exception e) {
            System.err.println("Alert Error: " + e.getMessage());
        }
    }

    private void sendEmail(String txId, String details, String subject) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo("khatrimahima440@gmail.com");
            mail.setSubject(subject);
            mail.setText(details + "\n\nPlease login to your Dashboard to take action.");
            mailSender.send(mail);
            System.out.println("✓ Alert Email sent successfully for: " + txId);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private PaySimTransactionResponse getRuleBasedResponse(HybridTransactionRequest request) {
        try {
            PaySimTransactionRequest paySimRequest = new PaySimTransactionRequest();
            paySimRequest.setType(request.getType());
            paySimRequest.setAmount(request.getAmount());
            paySimRequest.setOldbalanceOrg(request.getOldbalanceOrg());
            paySimRequest.setNewbalanceOrig(request.getNewbalanceOrig());
            paySimRequest.setOldbalanceDest(request.getOldbalanceDest());
            paySimRequest.setNewbalanceDest(request.getNewbalanceDest());
            paySimRequest.setUserId(request.getUserId());
            paySimRequest.setLocation(request.getLocation());
            paySimRequest.setDevice(request.getDevice());
            paySimRequest.setMerchantName(request.getMerchantName());
            paySimRequest.setSenderAccountId(request.getSenderAccountId());
            paySimRequest.setReceiverAccountId(request.getReceiverAccountId());
            return paySimService.processTransaction(paySimRequest);
        } catch (Exception e) {
            return new PaySimTransactionResponse("ERROR", 0.0, 0.0, false, "LOW", new ArrayList<>(), "Error", LocalDateTime.now(), "ERROR");
        }
    }

    private void saveToDatabase(HybridTransactionRequest request, String transactionId, double mlScore, double ruleBasedScore, double combinedScore, String riskLevel, String status, List<com.example.bankingsystem.paysim.FraudReason> fraudReasons, String recommendation, LocalDateTime transactionTime) {
        try (Connection con = dataSource.getConnection()) {
            String query = "INSERT INTO hybrid_transactions (transaction_id, user_id, type, amount, oldbalance_org, newbalance_orig, oldbalance_dest, newbalance_dest, location, device, merchant_name, ml_score, rule_score, combined_score, risk_level, status, fraud_reasons, recommendation, transaction_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(query)) {
                ps.setString(1, transactionId); ps.setString(2, request.getUserId()); ps.setString(3, request.getType()); ps.setDouble(4, request.getAmount()); ps.setDouble(5, request.getOldbalanceOrg()); ps.setDouble(6, request.getNewbalanceOrig()); ps.setDouble(7, request.getOldbalanceDest()); ps.setDouble(8, request.getNewbalanceDest()); ps.setString(9, request.getLocation()); ps.setString(10, request.getDevice()); ps.setString(11, request.getMerchantName()); ps.setDouble(12, mlScore); ps.setDouble(13, ruleBasedScore); ps.setDouble(14, combinedScore); ps.setString(15, riskLevel); ps.setString(16, status);
                StringBuilder reasonsText = new StringBuilder();
                for (com.example.bankingsystem.paysim.FraudReason reason : fraudReasons) {
                    reasonsText.append(reason.getReason().replace("$", "₹")).append("; ");
                }
                ps.setString(17, reasonsText.toString()); ps.setString(18, recommendation); ps.setObject(19, transactionTime);
                ps.executeUpdate();
            }
        } catch (SQLException e) { System.err.println("DB Error: " + e.getMessage()); }
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalTransactions", totalTransactions);
        analytics.put("lowRisk", lowRiskCount);
        analytics.put("mediumRisk", mediumRiskCount);
        analytics.put("highRisk", highRiskCount);
        analytics.put("approvedCount", lowRiskCount);
        analytics.put("holdCount", mediumRiskCount);
        analytics.put("blockedCount", highRiskCount);
        return analytics;
    }
}

