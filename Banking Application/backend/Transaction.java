import java.util.Scanner;

public class Transaction {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        try {
            // Input details
            System.out.print("Enter User ID: ");
            String userId = sc.nextLine();

            System.out.print("Enter Mobile Number: ");
            String mobile = sc.nextLine();

            System.out.print("Enter Transaction Amount: ");
            double amount = sc.nextDouble();

            // Validation
            if (userId.isEmpty())
                throw new Exception("User ID cannot be empty");

            if (mobile.length() != 10)
                throw new Exception("Invalid mobile number");

            if (amount <= 0)
                throw new Exception("Amount must be greater than zero");

            // Fraud condition
            String status;
            if (amount > 50000) {
                status = "FRAUD ALERT";
            } else {
                status = "SUCCESS";
            }

            // Output
            System.out.println("\nTransaction Details");
            System.out.println("-------------------");
            System.out.println("User ID: " + userId);
            System.out.println("Mobile Number: " + mobile);
            System.out.println("Amount: " + amount);
            System.out.println("Transaction Status: " + status);

        } catch (Exception e) {
            System.out.println("Transaction Error: " + e.getMessage());
        } finally {
            sc.close();
        }
    }
}
