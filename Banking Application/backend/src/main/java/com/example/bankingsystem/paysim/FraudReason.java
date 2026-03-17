package com.example.bankingsystem.paysim;

public class FraudReason {
    private String reason;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    public FraudReason() {}

    public FraudReason(String reason, String severity) {
        this.reason = reason;
        this.severity = severity;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    @Override
    public String toString() {
        return "[" + severity + "] " + reason;
    }
}
