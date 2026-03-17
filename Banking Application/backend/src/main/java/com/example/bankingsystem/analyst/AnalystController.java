package com.example.bankingsystem.analyst;

import com.example.bankingsystem.alert.Alert;
import com.example.bankingsystem.hybrid.HybridTransaction;
import com.example.bankingsystem.hybrid.HybridTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/analyst")
@CrossOrigin(origins = "*")
public class AnalystController {

    @Autowired
    private AnalystService analystService;

    @Autowired
    private HybridTransactionRepository transactionRepository;

    /**
     * Perform analyst action (approve, reject, escalate, add note)
     */
    @PostMapping("/action")
    public ResponseEntity<Map<String, Object>> performAction(@RequestBody Map<String, String> request) {
        String transactionId = request.get("transactionId");
        String analystUsername = request.get("analystUsername");
        String actionType = request.get("actionType");
        String notes = request.get("notes");

        try {
            Map<String, Object> result = analystService.performAction(
                transactionId, analystUsername, actionType, notes
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get transaction history with filters
     */
    @GetMapping("/transactions")
    public ResponseEntity<Map<String, Object>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        try {
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by("transactionTime").descending());
            Page<HybridTransaction> transactions;

            if (riskLevel != null && !riskLevel.isEmpty()) {
                transactions = transactionRepository.findByRiskLevel(riskLevel, pageRequest);
            } else if (status != null && !status.isEmpty()) {
                transactions = transactionRepository.findByStatus(status, pageRequest);
            } else if (search != null && !search.isEmpty()) {
                transactions = transactionRepository.findByTransactionIdContainingOrUserIdContaining(
                    search, search, pageRequest
                );
            } else {
                transactions = transactionRepository.findAll(pageRequest);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("transactions", transactions.getContent());
            response.put("currentPage", transactions.getNumber());
            response.put("totalPages", transactions.getTotalPages());
            response.put("totalItems", transactions.getTotalElements());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transaction details by ID
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<Map<String, Object>> getTransactionDetails(@PathVariable String transactionId) {
        Optional<HybridTransaction> txnOpt = transactionRepository.findByTransactionId(transactionId);
        
        if (txnOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        HybridTransaction transaction = txnOpt.get();
        List<AnalystAction> actions = analystService.getTransactionHistory(transactionId);

        Map<String, Object> response = new HashMap<>();
        response.put("transaction", transaction);
        response.put("analystActions", actions);

        return ResponseEntity.ok(response);
    }

    /**
     * Get unread alerts
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<Alert>> getAlerts() {
        List<Alert> alerts = analystService.getUnreadAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Mark alert as read
     */
    @PostMapping("/alerts/{alertId}/read")
    public ResponseEntity<Map<String, Object>> markAlertAsRead(
            @PathVariable Long alertId,
            @RequestParam String analystUsername) {
        try {
            analystService.markAlertAsRead(alertId, analystUsername);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Get user risk profile
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable String userId) {
        Map<String, Object> profile = analystService.getUserRiskProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Get analyst's action history
     */
    @GetMapping("/my-actions/{analystUsername}")
    public ResponseEntity<List<AnalystAction>> getMyActions(@PathVariable String analystUsername) {
        List<AnalystAction> actions = analystService.getAnalystActions(analystUsername);
        return ResponseEntity.ok(actions);
    }

    /**
     * Get confusion matrix and performance metrics
     */
    @GetMapping("/confusion-matrix")
    public ResponseEntity<Map<String, Object>> getConfusionMatrix() {
        Map<String, Object> metrics = analystService.getConfusionMatrixMetrics();
        return ResponseEntity.ok(metrics);
    }
}
