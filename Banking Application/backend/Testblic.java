import java.sql.Connection;
import java.sql.DriverManager;

public class Testblic {
    public static void main(String[] args) {
        try {
            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/banking_system",
                    "root",
                    "R#mm#@123^sql");

            System.out.println("Connected Successfully!");
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
