package com.meena.frauddetection.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class NotificationSettingsController {
    
    public static boolean isEmailAlertEnabled = true;

    @GetMapping("/email-alerts")
    public boolean getStatus() {
        return isEmailAlertEnabled;
    }

    @PostMapping("/email-alerts")
    public boolean toggle(@RequestParam("enabled") boolean enabled) {
        isEmailAlertEnabled = enabled;
        System.out.println(">>> Global Notification Setting: Email Alerts = " + isEmailAlertEnabled);
        return isEmailAlertEnabled;
    }
}
