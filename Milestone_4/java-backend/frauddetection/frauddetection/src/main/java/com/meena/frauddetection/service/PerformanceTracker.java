package com.meena.frauddetection.service;

import org.springframework.stereotype.Component;
import java.util.LinkedList;
import java.util.Queue;

/**
 * PerformanceTracker — Stores recent timing measurements in memory.
 * 
 * HOW IT WORKS:
 * - Each time a transaction is processed, we record how long it took (in ms).
 * - Each time an email alert is sent, we record how long it took (in ms).
 * - We keep only the last 100 samples to avoid using too much memory.
 * - The telemetry API reads the averages from here.
 */
@Component
public class PerformanceTracker {

    // Maximum number of samples to keep in memory
    private static final int MAX_SAMPLES = 100;

    // Queues to store recent latency values (in milliseconds)
    private static final Queue<Long> analysisLatencies = new LinkedList<>();
    private static final Queue<Long> emailLatencies = new LinkedList<>();

    /**
     * Record how long processTransaction() took.
     * Called from TransactionService after each transaction.
     */
    public static synchronized void recordAnalysisLatency(long milliseconds) {
        analysisLatencies.add(milliseconds);
        // Remove the oldest sample if we exceed the limit
        if (analysisLatencies.size() > MAX_SAMPLES) {
            analysisLatencies.poll();
        }
    }

    /**
     * Record how long sendFraudAlert() took.
     * Called from TransactionController after each email dispatch.
     */
    public static synchronized void recordEmailLatency(long milliseconds) {
        emailLatencies.add(milliseconds);
        // Remove the oldest sample if we exceed the limit
        if (emailLatencies.size() > MAX_SAMPLES) {
            emailLatencies.poll();
        }
    }

    /**
     * Get the average analysis latency from recent samples.
     * Returns 0 if no samples have been recorded yet.
     */
    public static synchronized long getAvgAnalysisLatency() {
        if (analysisLatencies.isEmpty()) return 0;

        long total = 0;
        for (Long value : analysisLatencies) {
            total += value;
        }
        return total / analysisLatencies.size();
    }

    /**
     * Get the average email dispatch latency from recent samples.
     * Returns 0 if no samples have been recorded yet.
     */
    public static synchronized long getAvgEmailLatency() {
        if (emailLatencies.isEmpty()) return 0;

        long total = 0;
        for (Long value : emailLatencies) {
            total += value;
        }
        return total / emailLatencies.size();
    }

    /**
     * Get the total number of analysis samples recorded.
     */
    public static synchronized int getAnalysisSampleCount() {
        return analysisLatencies.size();
    }

    /**
     * Get the total number of email samples recorded.
     */
    public static synchronized int getEmailSampleCount() {
        return emailLatencies.size();
    }
}
