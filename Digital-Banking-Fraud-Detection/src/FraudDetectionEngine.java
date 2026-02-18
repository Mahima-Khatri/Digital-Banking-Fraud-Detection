import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class FraudDetectionEngine {

    private static final String URL = "jdbc:mysql://localhost:3306/banking_db";
    private static final String USER = "root";
    private static final String PASSWORD = "Mahi";

    public static void main(String[] args) {

        Random random = new Random();
        BigDecimal balance = new BigDecimal("500000.00");

        String[] devices = {"ATM", "Laptop", "iPhone", "Android Phone", "Chrome-Web"};
        String[] locations = {"Hyderabad", "Mumbai", "Delhi", "Bangalore", "Singapore", "New York"};
        String[] authTypes = {"PIN", "OTP", "Biometric", "NONE"};
        String[] modes = {"UPI", "IMPS", "NEFT", "RTGS"};
        String[] types = {"Credit", "Debit"};

        Map<String, Integer> transactionCount = new HashMap<>();
        Map<String, String> lastLocation = new HashMap<>();

        try (Connection con = DriverManager.getConnection(URL, USER, PASSWORD)) {

            String sql = """
                INSERT INTO transactions (
                    txn_id, transaction_type, transaction_mode, amount, txn_time,
                    sender_id, sender_account, sender_mobile, sender_device, sender_location,
                    receiver_id, receiver_account, receiver_mobile, receiver_location,
                    auth_type, ip_address,
                    risk_score, status, failure_reason, balance
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """;

            PreparedStatement ps = con.prepareStatement(sql);

            for (int i = 1; i <= 50; i++) {

                String txnId = "TXN" + (100000 + random.nextInt(900000));
                String txnType = types[random.nextInt(types.length)];
                String txnMode = modes[random.nextInt(modes.length)];
                BigDecimal amount = new BigDecimal(
                        String.format("%.2f", 1000 + random.nextDouble() * 90000)
                );


                String senderId = "USER" + (1000 + random.nextInt(9000));
                String senderAccount = "ACC" + (100000 + random.nextInt(900000));
                String senderMobile = "9" + (100000000 + random.nextInt(900000000));
                String senderDevice = devices[random.nextInt(devices.length)];
                String senderLocation = locations[random.nextInt(locations.length)];

                String receiverId = "USER" + (1000 + random.nextInt(9000));
                String receiverAccount = "ACC" + (100000 + random.nextInt(900000));
                String receiverMobile = "8" + (100000000 + random.nextInt(900000000));
                String receiverLocation = locations[random.nextInt(locations.length)];

                String authType = authTypes[random.nextInt(authTypes.length)];
                String ip = "192.168." + random.nextInt(255) + "." + random.nextInt(255);

                int riskScore = 0;
                String failureReason;

                // FRAUD SCORING RULES

                if (amount.compareTo(new BigDecimal("75000")) > 0)
                    riskScore += 40;

                if (senderLocation.equals("Singapore") || senderLocation.equals("New York"))
                    riskScore += 30;

                if (authType.equals("NONE"))
                    riskScore += 40;

                if (senderDevice.contains("Web"))
                    riskScore += 10;

                if (lastLocation.containsKey(senderId) &&
                        !lastLocation.get(senderId).equals(senderLocation))
                    riskScore += 25;

                lastLocation.put(senderId, senderLocation);

                transactionCount.put(senderId,
                        transactionCount.getOrDefault(senderId, 0) + 1);

                if (transactionCount.get(senderId) > 3)
                    riskScore += 30;

                //FINAL STATUS DECISION

                String status;

                if (riskScore >= 80) {
                    status = "FRAUD-BLOCKED";
                    failureReason = "High Fraud Score";
                }
                else if (txnType.equals("Debit") && amount.compareTo(balance) > 0) {
                    status = "FAILED";
                    failureReason = "Insufficient Balance";
                }
                else if (riskScore >= 50) {
                    status = "FLAGGED";
                    failureReason = "High Risk Indicators";
                }
                else if (riskScore >= 30) {
                    status = "SUSPICIOUS";
                    failureReason = "Moderate Risk Detected";
                }
                else {
                    status = "SUCCESS";
                    failureReason = "Transaction Successful";
                }

                // Update balance only if transaction allowed
                if (status.equals("SUCCESS") ||
                        status.equals("FLAGGED") ||
                        status.equals("SUSPICIOUS")) {

                    if (txnType.equals("Debit"))
                        balance = balance.subtract(amount);
                    else
                        balance = balance.add(amount);
                }

                balance = balance.setScale(2, RoundingMode.HALF_UP);

                //INSERT INTO DATABASE

                ps.setString(1, txnId);
                ps.setString(2, txnType);
                ps.setString(3, txnMode);
                ps.setBigDecimal(4, amount);
                ps.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));

                ps.setString(6, senderId);
                ps.setString(7, senderAccount);
                ps.setString(8, senderMobile);
                ps.setString(9, senderDevice);
                ps.setString(10, senderLocation);

                ps.setString(11, receiverId);
                ps.setString(12, receiverAccount);
                ps.setString(13, receiverMobile);
                ps.setString(14, receiverLocation);

                ps.setString(15, authType);
                ps.setString(16, ip);

                ps.setInt(17, riskScore);
                ps.setString(18, status);
                ps.setString(19, failureReason);
                ps.setBigDecimal(20, balance);

                ps.executeUpdate();

                System.out.println("Txn: " + txnId +
                        " | ₹" + amount +
                        " | Score: " + riskScore +
                        " | Status: " + status +
                        " | Reason: " + failureReason);
            }

            System.out.println("\nAll transactions processed successfully!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
