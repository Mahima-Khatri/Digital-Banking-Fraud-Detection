import java.time.LocalDateTime;
import java.util.Random;
import java.util.Scanner;

public class RealTimeTransaction {

    public static void main(String[] args) {

        Random random = new Random();
        double balance = 100000;   // Initial balance
        int fraudCount = 0;
        int successCount = 0;
        int failedCount = 0;
        int n=0;

        System.out.println("Enter the number of transactions to simulate: ");
        try (Scanner scanner = new Scanner(System.in)) {
            n = scanner.nextInt();
        } catch (Exception e) {
            System.out.println("Invalid input. Please enter a valid number.");
            return;
        }

        System.out.println("\nInitial Balance: " + balance);

        // Predefined Locations
        String[] locations = {"Mumbai", "Delhi", "Chennai", "Bangalore", "Hyderabad", "Kolkata"};

        // Transaction Types
        String[] transactionTypes = {"CREDIT", "DEBIT"};

        System.out.println("===== REAL-TIME TRANSACTION SIMULATION =====\n");

        for (int i = 1; i <= n; i++) {

            try {

                String transactionId = "TXN" + (10000 + random.nextInt(90000));
                String userId = "U" + (1000 + random.nextInt(9000));
                String senderAcc = "ACC" + (100000 + random.nextInt(900000));
                String receiverAcc = "ACC" + (100000 + random.nextInt(900000));

                double amount = 1000 + random.nextInt(90000);

                // Random Location
                String location = locations[random.nextInt(locations.length)];

                // Random Transaction Type
                String transactionType = transactionTypes[random.nextInt(transactionTypes.length)];

                String status;

                if (transactionType.equals("DEBIT")) {

                    // Fraud Rule for Debit
                    if (amount > 50000) {
                        status = "FRAUD ALERT";
                        fraudCount++;
                    }
                    else if (amount > balance) {
                        status = "FAILED - INSUFFICIENT BALANCE";
                        failedCount++;
                    }
                    else {
                        balance -= amount;
                        status = "SUCCESS";
                        successCount++;
                    }

                } else {  // CREDIT

                    balance += amount;
                    status = "SUCCESS";
                    successCount++;
                }

                // Display Transaction Details
                System.out.println("Transaction " + i);
                System.out.println("Transaction ID: " + transactionId);
                System.out.println("User ID: " + userId);
                System.out.println("Transaction Type: " + transactionType);
                System.out.println("Sender Account: " + senderAcc);
                System.out.println("Receiver Account: " + receiverAcc);
                System.out.println("Location: " + location);
                System.out.println("Amount: " + amount);
                System.out.println("Date & Time: " + LocalDateTime.now());
                System.out.println("Status: " + status);
                System.out.println("Remaining Balance: " + balance);
                System.out.println("--------------------------------------------");

            } catch (Exception e) {
                System.out.println("Error processing transaction: " + e.getMessage());
            }
        }

        // Final Summary
        System.out.println("\n===== TRANSACTION SUMMARY =====");
        System.out.println("Total Transactions: " + n);
        System.out.println("Successful Transactions: " + successCount);
        System.out.println("Failed Transactions: " + failedCount);
        System.out.println("Fraud Transactions: " + fraudCount);
        System.out.println("Final Balance: " + balance);
    }
}
