package com.meena.frauddetection.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendFraudAlert(String to, String transactionId, double amount, String riskLevel) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        
        String subject = "";
        String body = "";
        String timestamp = java.time.LocalDateTime.now().toString();

        if (riskLevel.equalsIgnoreCase("HIGH")) {
            subject = "🚨 HIGH RISK ALERT: Immediate Action Required";
            body = String.format(
                "🚨 FRAUD DETECTION ALERT 🚨\n\n" +
                "Transaction Details:\n" +
                "----------------------------\n" +
                "Transaction ID : %s\n" +
                "Amount         : ₹%.2f\n" +
                "Risk Level     : HIGH RISK\n" +
                "Status         : BLOCKED\n\n" +
                "Action Required:\n" +
                "This transaction has been automatically blocked due to high fraud risk.\n" +
                "Immediate investigation is strongly recommended.\n\n" +
                "System: Digital Banking Fraud Detection\n" +
                "Time: %s",
                transactionId, amount, timestamp
            );
        } else if (riskLevel.equalsIgnoreCase("MEDIUM")) {
            subject = "⚠️ MEDIUM RISK ALERT: Review Required";
            body = String.format(
                "⚠️ FRAUD RISK ALERT ⚠️\n\n" +
                "Transaction Details:\n" +
                "----------------------------\n" +
                "Transaction ID : %s\n" +
                "Amount         : ₹%.2f\n" +
                "Risk Level     : MEDIUM RISK\n" +
                "Status         : PENDING REVIEW\n\n" +
                "Action Required:\n" +
                "This transaction is flagged as medium risk and is currently on hold.\n" +
                "Please review and approve or reject the transaction.\n\n" +
                "System: Digital Banking Fraud Detection\n" +
                "Time: %s",
                transactionId, amount, timestamp
            );
        } else {
            subject = "Fraud Alert";
            body = String.format(
                "Info: A transaction with risk level %s has been detected.\n\n" +
                "Transaction ID : %s\n" +
                "Amount         : ₹%.2f\n" +
                "Time: %s",
                riskLevel, transactionId, amount, timestamp
            );
        }

        message.setSubject(subject);
        message.setText(body);
        
        try {
            mailSender.send(message);
            System.out.println("Fraud Alert email sent successfully for transaction: " + transactionId);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: Failed to send fraud alert email for transaction " + transactionId);
            System.err.println("Error message: " + e.getMessage());
            // We catch but do not rethrow to prevent crashing the transaction process
        }
    }

    public void sendWelcomeEmail(String toEmail, String username, String role, String password) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to SecurePay Fraud Detection - Access Provisioned");

            String htmlBody = String.format(
                "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;\">" +
                "  <!-- Header with Brand Icon -->" +
                "  <div style=\"background: linear-gradient(135deg, #0f172a 0%%, #1e293b 100%%); padding: 40px; text-align: center;\">" +
                "    <!-- Premium Shield Check Icon -->" +
                "    <div style=\"background-color: #2563eb; width: 68px; height: 68px; border-radius: 18px; margin: 0 auto 24px auto; display: table; border: 1px solid rgba(255,255,255,0.1);\">" +
                "      <div style=\"display: table-cell; vertical-align: middle; text-align: center;\">" +
                "        <!-- Pure CSS Shield & Checkmark -->" +
                "        <div style=\"width: 30px; height: 34px; border: 3px solid #ffffff; border-radius: 4px 4px 15px 15px; margin: 0 auto; position: relative;\">" +
                "            <div style=\"width: 12px; height: 6px; border-left: 3px solid #ffffff; border-bottom: 3px solid #ffffff; position: absolute; top: 10px; left: 8px; transform: rotate(-45deg); -webkit-transform: rotate(-45deg);\"></div>" +
                "        </div>" +
                "      </div>" +
                "    </div>" +
                "    <h1 style=\"color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px; font-weight: 800; font-family: 'Outfit', sans-serif;\">SecurePay</h1>" +
                "    <p style=\"color: #94a3b8; margin: 10px 0 0 0; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 2px;\">Access Provisioned & Verified</p>" +
                "  </div>" +
                "  " +
                "  <!-- Body Content -->" +
                "  <div style=\"padding: 40px;\">" +
                "    <h2 style=\"color: #1e293b; margin-top: 0;\">Clearance Granted</h2>" +
                "    <p style=\"color: #475569; line-height: 1.6;\">Your access to the SecurePay monitoring system has been successfully provisioned by your platform administrator.</p>" +
                "    " +
                "    <div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;\">" +
                "      <p style=\"margin: 0 0 10px 0; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase;\">Account Credentials</p>" +
                "      <div style=\"font-family: monospace; font-size: 14px; color: #334155;\">" +
                "        <p style=\"margin: 5px 0;\"><strong>Username  :</strong> %s</p>" +
                "        <p style=\"margin: 5px 0;\"><strong>Role      :</strong> %s</p>" +
                "        <p style=\"margin: 5px 0;\"><strong>Password  :</strong> <span style=\"background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px;\">%s</span></p>" +
                "      </div>" +
                "    </div>" +
                "    " +
                "    <h3 style=\"color: #1e293b; font-size: 16px;\">Onboarding Instructions</h3>" +
                "    <ol style=\"color: #475569; padding-left: 20px; line-height: 1.6;\">" +
                "      <li style=\"margin-bottom: 8px;\">Log in to the <a href=\"http://localhost:5173\" style=\"color: #2563eb; text-decoration: none; font-weight: 600;\">SecurePay Operations Portal</a>.</li>" +
                "      <li style=\"margin-bottom: 8px;\">Update your password in the <strong>Settings</strong> module.</li>" +
                "      <li style=\"margin-bottom: 8px;\">Review the live transaction feed and global threat map.</li>" +
                "    </ol>" +
                "    " +
                "    <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;\">" +
                "      <p>This is an automated notification from the <strong>SecurePay Pro Core Engine</strong>. If you did not expect this clearance, please contact your security lead immediately.</p>" +
                "    </div>" +
                "  </div>" +
                "  " +
                "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;\">" +
                "    © 2026 SecurePay Digital Banking. High-Security Environment." +
                "  </div>" +
                "</div>",
                username, role, password
            );

            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            System.out.println("HTML Welcome email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send HTML welcome email to: " + toEmail);
            System.err.println("Error message: " + e.getMessage());
        }
    }
}