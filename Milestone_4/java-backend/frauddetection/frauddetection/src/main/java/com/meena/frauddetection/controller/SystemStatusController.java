package com.meena.frauddetection.controller;

import com.meena.frauddetection.service.SystemMetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = "*")
public class SystemStatusController {

    @Autowired
    private SystemMetricsService systemMetricsService;

    @GetMapping("/health")
    public Map<String, Object> getSystemHealth() {
        return systemMetricsService.getSystemHealth();
    }

    // NEW: Real-time telemetry endpoint
    @GetMapping("/telemetry")
    public Map<String, Object> getTelemetry() {
        return systemMetricsService.getTelemetryMetrics();
    }
}
