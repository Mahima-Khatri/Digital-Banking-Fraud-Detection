import java.util.Scanner;
public class Registration {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try {
            // Input details
            System.out.print("Enter Name: ");
            String name = sc.nextLine();

            System.out.print("Enter Mobile Number: ");
            String mobile = sc.nextLine();

            System.out.print("Enter Email: ");
            String email = sc.nextLine();

            System.out.print("Enter Location: ");
            String location = sc.nextLine();

            // Validation of inputs
            if (name.isEmpty())
                throw new Exception("Name cannot be empty");

            if (mobile.length() != 10)
                throw new Exception("Mobile number must be 10 digits");

            if (!email.contains("@"))
                throw new Exception("Invalid email format");

            // Generate User ID 
            String userId = "U" + (int)(Math.random() * 1000);

            // Output
            System.out.println("\nRegistration Successful!");
            System.out.println("User ID: " + userId);
            System.out.println("Name: " + name);
            System.out.println("Mobile: " + mobile);
            System.out.println("Email: " + email);
            System.out.println("Location: " + location);

        } catch (Exception e) {
            System.out.println("Registration Error: " + e.getMessage());
        }
    }
}
