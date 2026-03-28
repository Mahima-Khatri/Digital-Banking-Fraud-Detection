package com.meena.frauddetection.controller;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private static final List<Map<String, String>> auditLogs = new CopyOnWriteArrayList<>();
    private static final int MAX_LOGS = 200;
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @PostMapping("/log")
    public Map<String, String> addLog(@RequestBody Map<String, String> request) {
        String user     = request.getOrDefault("user", "Unknown");
        String role     = request.getOrDefault("role", "Unknown");
        String action   = request.getOrDefault("action", "Unknown Action");
        String category = request.getOrDefault("category", "GENERAL");
        String severity = request.getOrDefault("severity", "INFO");
        String details  = request.getOrDefault("details", "");

        Map<String, String> entry = new LinkedHashMap<>();
        entry.put("id",        String.valueOf(System.currentTimeMillis()));
        entry.put("timestamp", LocalDateTime.now().format(FORMATTER));
        entry.put("user",      user);
        entry.put("role",      role);
        entry.put("action",    action);
        entry.put("category",  category);
        entry.put("severity",  severity);
        entry.put("details",   details);

        auditLogs.add(0, entry);   // newest first
        if (auditLogs.size() > MAX_LOGS) {
            auditLogs.subList(MAX_LOGS, auditLogs.size()).clear();
        }

        return entry;
    }

    @GetMapping("/logs")
    public List<Map<String, String>> getLogs(
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        return auditLogs.subList(0, Math.min(limit, auditLogs.size()));
    }

    @DeleteMapping("/logs")
    public Map<String, String> clearLogs() {
        auditLogs.clear();
        Map<String, String> res = new HashMap<>();
        res.put("message", "Audit logs cleared");
        return res;
    }
}
