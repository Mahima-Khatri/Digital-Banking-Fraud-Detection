package com.meena.frauddetection.service;

import com.meena.frauddetection.model.PaymentTransaction;
import com.meena.frauddetection.model.FraudMLRequest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class FraudService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> checkFraud(PaymentTransaction tx) {

        FraudMLRequest request = new FraudMLRequest();

        // Transaction amount
        request.amt = tx.getAmount();

        // Static values (for testing/demo)
        request.category = 1;
        request.merchant = 10;
        request.gender = 1;
        request.city = 100;
        request.state = 10;
        request.zip = 500000;

        request.lat = 36.1;
        request.lon = -81.2;

        request.city_pop = 5000;
        request.job = 45;

        LocalDateTime now = LocalDateTime.now();

        request.transaction_hour = now.getHour();
        request.transaction_day = now.getDayOfMonth();
        request.transaction_month = now.getMonthValue();
        request.unix_time = System.currentTimeMillis() / 1000;

        request.merch_lat = 36.01;
        request.merch_long = -82.04;

        String url = "http://localhost:8000/predict";

        try {
            // Using ParameterizedTypeReference to avoid "unchecked" warning
            ParameterizedTypeReference<Map<String, Object>> responseType = 
                new ParameterizedTypeReference<>() {};
            
            HttpEntity<FraudMLRequest> entity = new HttpEntity<>(request);
            
            ResponseEntity<Map<String, Object>> responseEntity = 
                restTemplate.exchange(url, HttpMethod.POST, entity, responseType);

            return responseEntity.getBody() != null ? responseEntity.getBody() : new HashMap<>();

        } catch (Exception e) {
            System.err.println("ML Service Error: " + e.getMessage());

            Map<String, Object> fallback = new HashMap<>();
            fallback.put("prediction", "Safe"); // Default to safe if service is down
            fallback.put("message", "ML service unavailable: " + e.getMessage());
            return fallback;
        }
    }
}