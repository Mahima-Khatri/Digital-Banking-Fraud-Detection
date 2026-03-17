package com.example.bankingsystem.realtime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/realtime-transactions")
public class RealTimeTransactionController {

    @Autowired
    private RealTimeTransactionService realTimeTransactionService;

    @PostMapping
    public ResponseEntity<RealTimeTransactionResponse> processTransaction(@RequestBody RealTimeTransactionRequest request) {
        try {
            RealTimeTransactionResponse response = realTimeTransactionService.processTransaction(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}