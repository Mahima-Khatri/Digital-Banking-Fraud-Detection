package com.example.bankingsystem.paysim;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class PaySimFraudDetectionServiceTest {

    @Autowired
    private PaySimFraudDetectionService fraudDetectionService;

    @Test
    public void testNormalPaymentTransaction() {
        // Normal PAYMENT transaction - should be LOW risk
        PaySimTransactionRequest request = new PaySimTransactionRequest();
        request.setType("PAYMENT");
        request.setAmount(9839.64);
        request.setOldbalanceOrg(170136.0);
        request.setNewbalanceOrig(160296.36);
        request.setOldbalanceDest(0.0);
        request.setNewbalanceDest(0.0);

        PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);

        assertNotNull(response);
        assertEquals("LOW", response.getRiskLevel());
        assertFalse(response.getIsFraud());
        assertEquals("APPROVED", response.getStatus());
        assertTrue(response.getFraudScore() < 0.3);
    }

    @Test
    public void testSuspiciousTransferWithAccountEmptying() {
        // TRANSFER with account emptying - should be CRITICAL risk
        PaySimTransactionRequest request = new PaySimTransactionRequest();
        request.setType("TRANSFER");
        request.setAmount(181.0);
        request.setOldbalanceOrg(181.0);
        request.setNewbalanceOrig(0.0); // Account emptied!
        request.setOldbalanceDest(0.0);
        request.setNewbalanceDest(0.0);

        PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);

        assertNotNull(response);
        assertTrue(response.getRiskLevel().equals("HIGH") || response.getRiskLevel().equals("CRITICAL"));
        assertTrue(response.getIsFraud());
        assertTrue(response.getFraudScore() >= 0.5);
        assertTrue(response.getReasons().size() > 0);
    }

    @Test
    public void testHighAmountCashOut() {
        // High amount CASH_OUT - should be MEDIUM/HIGH risk
        PaySimTransactionRequest request = new PaySimTransactionRequest();
        request.setType("CASH_OUT");
        request.setAmount(229133.94);
        request.setOldbalanceOrg(250000.0);
        request.setNewbalanceOrig(20866.06);
        request.setOldbalanceDest(5083.0);
        request.setNewbalanceDest(234216.94);

        PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);

        assertNotNull(response);
        assertTrue(response.getFraudScore() > 0.2); // Should have some risk
        assertTrue(response.getReasons().size() > 0);
    }

    @Test
    public void testBalanceInconsistency() {
        // Transaction with balance inconsistencies
        PaySimTransactionRequest request = new PaySimTransactionRequest();
        request.setType("TRANSFER");
        request.setAmount(50000.0);
        request.setOldbalanceOrg(100000.0);
        request.setNewbalanceOrig(30000.0); // Should be 50000 (inconsistent!)
        request.setOldbalanceDest(10000.0);
        request.setNewbalanceDest(70000.0); // Should be 60000 (inconsistent!)

        PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);

        assertNotNull(response);
        assertTrue(response.getFraudScore() > 0.0);
        
        // Should detect balance inconsistencies
        boolean hasInconsistencyReason = response.getReasons().stream()
                .anyMatch(r -> r.getReason().contains("inconsistency"));
        assertTrue(hasInconsistencyReason);
    }

    @Test
    public void testMuleAccountDetection() {
        // Transaction to zero-balance account (mule account)
        PaySimTransactionRequest request = new PaySimTransactionRequest();
        request.setType("TRANSFER");
        request.setAmount(100000.0);
        request.setOldbalanceOrg(150000.0);
        request.setNewbalanceOrig(50000.0);
        request.setOldbalanceDest(0.0); // Mule account!
        request.setNewbalanceDest(100000.0);

        PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);

        assertNotNull(response);
        
        // Should detect mule account
        boolean hasMuleAccountReason = response.getReasons().stream()
                .anyMatch(r -> r.getReason().contains("mule account"));
        assertTrue(hasMuleAccountReason);
    }

    @Test
    public void testAmountExceedsBalance() {
        // Amount exceeds sender balance
        PaySimTransactionRequest request = new PaySimTransactionRequest();
        request.setType("TRANSFER");
        request.setAmount(200000.0);
        request.setOldbalanceOrg(100000.0); // Amount exceeds this!
        request.setNewbalanceOrig(0.0);
        request.setOldbalanceDest(50000.0);
        request.setNewbalanceDest(250000.0);

        PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);

        assertNotNull(response);
        assertTrue(response.getFraudScore() > 0.5); // Should be high risk
        
        // Should detect amount exceeds balance
        boolean hasExceedsReason = response.getReasons().stream()
                .anyMatch(r -> r.getReason().contains("exceeds"));
        assertTrue(hasExceedsReason);
    }

    @Test
    public void testRoundAmountPattern() {
        // Round amount (potential money laundering)
        PaySimTransactionRequest request = new PaySimTransactionRequest();
        request.setType("TRANSFER");
        request.setAmount(50000.0); // Round amount
        request.setOldbalanceOrg(100000.0);
        request.setNewbalanceOrig(50000.0);
        request.setOldbalanceDest(20000.0);
        request.setNewbalanceDest(70000.0);

        PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);

        assertNotNull(response);
        
        // Should detect round amount
        boolean hasRoundAmountReason = response.getReasons().stream()
                .anyMatch(r -> r.getReason().contains("Round amount"));
        assertTrue(hasRoundAmountReason);
    }

    @Test
    public void testResponseStructure() {
        // Test that response has all required fields
        PaySimTransactionRequest request = new PaySimTransactionRequest();
        request.setType("PAYMENT");
        request.setAmount(1000.0);
        request.setOldbalanceOrg(10000.0);
        request.setNewbalanceOrig(9000.0);
        request.setOldbalanceDest(5000.0);
        request.setNewbalanceDest(6000.0);

        PaySimTransactionResponse response = fraudDetectionService.processTransaction(request);

        assertNotNull(response.getTransactionId());
        assertNotNull(response.getFraudScore());
        assertNotNull(response.getFraudPercentage());
        assertNotNull(response.getIsFraud());
        assertNotNull(response.getRiskLevel());
        assertNotNull(response.getReasons());
        assertNotNull(response.getRecommendation());
        assertNotNull(response.getTransactionTime());
        assertNotNull(response.getStatus());
    }
}
