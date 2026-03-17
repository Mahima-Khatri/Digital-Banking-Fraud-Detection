package com.example.bankingsystem.hybrid;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Automatically generates transactions every 5 seconds
 */
@Component
public class TransactionGenerator {

    @Autowired
    private HybridFraudDetectionService hybridService;

    private final Random random = new Random();
    private final AtomicInteger transactionCount = new AtomicInteger(0);

    private final String[] transactionTypes = {"PAYMENT", "TRANSFER", "CASH_OUT", "DEBIT", "CASH_IN"};
    private final String[] locations = {"Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"};
    private final String[] devices = {"Android", "iOS", "Web"};

    /**
     * Generate transaction every 5 seconds (5000ms)
     */
    @Scheduled(fixedRate = 5000)
    public void generateTransaction() {
        try {
            HybridTransactionRequest request = createRandomTransaction();
            hybridService.processHybridTransaction(request);
            
            int count = transactionCount.incrementAndGet();
            System.out.println("✓ Auto-generated transaction #" + count + " - Type: " + request.getType() + 
                             ", Amount: $" + String.format("%.2f", request.getAmount()));
        } catch (Exception e) {
            System.err.println("Error generating transaction: " + e.getMessage());
        }
    }

    /**
     * Create random transaction with priority: LOW first, then MEDIUM, then HIGH
     * Pattern: First 10 = LOW, Next 10 = MEDIUM, Next 10 = HIGH, then repeat
     */
    private HybridTransactionRequest createRandomTransaction() {
        HybridTransactionRequest request = new HybridTransactionRequest();

        // Determine risk type based on transaction count
        // 0-9: LOW, 10-19: MEDIUM, 20-29: HIGH, then repeat
        int cycle = transactionCount.get() % 30;
        int riskType;
        
        if (cycle < 10) {
            riskType = 0; // LOW RISK
        } else if (cycle < 20) {
            riskType = 1; // MEDIUM RISK
        } else {
            riskType = 2; // HIGH RISK
        }

        String type;
        double amount;
        double oldBalanceOrg;
        double newBalanceOrig;
        double oldBalanceDest;
        double newBalanceDest;

        if (riskType == 0) {
            // LOW RISK - Normal transaction
            type = random.nextBoolean() ? "PAYMENT" : "CASH_IN";
            amount = 1000 + random.nextDouble() * 20000; // $1k - $21k
            oldBalanceOrg = amount + (50000 + random.nextDouble() * 100000);
            newBalanceOrig = oldBalanceOrg - amount;
            oldBalanceDest = 10000 + random.nextDouble() * 50000;
            newBalanceDest = oldBalanceDest + amount;
            
        } else if (riskType == 1) {
            // MEDIUM RISK - Moderate suspicious patterns
            type = random.nextBoolean() ? "TRANSFER" : "CASH_OUT";
            amount = 50000 + random.nextDouble() * 100000; // $50k - $150k
            oldBalanceOrg = amount + (20000 + random.nextDouble() * 50000);
            newBalanceOrig = oldBalanceOrg - amount;
            
            // 50% chance of mule account
            if (random.nextBoolean()) {
                oldBalanceDest = 0.0; // Mule account
            } else {
                oldBalanceDest = random.nextDouble() * 30000;
            }
            newBalanceDest = oldBalanceDest + amount;
            
        } else {
            // HIGH RISK - Strong fraud indicators
            type = random.nextBoolean() ? "TRANSFER" : "CASH_OUT";
            amount = 200000 + random.nextDouble() * 500000; // $200k - $700k
            oldBalanceOrg = amount + (random.nextDouble() * 50000);
            
            // Account emptying
            newBalanceOrig = 0.0;
            
            // Mule account
            oldBalanceDest = 0.0;
            newBalanceDest = amount;
        }

        request.setType(type);
        request.setAmount(amount);
        request.setOldbalanceOrg(oldBalanceOrg);
        request.setNewbalanceOrig(newBalanceOrig);
        request.setOldbalanceDest(oldBalanceDest);
        request.setNewbalanceDest(newBalanceDest);

        // Additional fields
        request.setUserId("USER" + (1000 + random.nextInt(9000)));
        request.setLocation(locations[random.nextInt(locations.length)]);
        request.setDevice(devices[random.nextInt(devices.length)]);
        request.setMerchantName(generateMerchantName());

        return request;
    }

    private String generateMerchantName() {
        String[] merchants = {
            "Amazon", "Flipkart", "Swiggy", "Zomato", "PayTM",
            "Google Pay", "PhonePe", "HDFC Bank", "ICICI Bank",
            "Reliance", "BigBazaar", "DMart", "Myntra"
        };
        return merchants[random.nextInt(merchants.length)];
    }

    public int getGeneratedCount() {
        return transactionCount.get();
    }
}
