package com.meena.frauddetection.controller;

import com.meena.frauddetection.model.ContactRequest;
import com.meena.frauddetection.repository.ContactRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactRequestController {

    @Autowired
    private ContactRequestRepository contactRequestRepository;

    @PostMapping("/request")
    public ContactRequest createRequest(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String message = request.get("message");

        if (name == null || email == null || message == null) {
            throw new RuntimeException("Name, Email, and Message are required");
        }

        ContactRequest contactRequest = new ContactRequest(name, email, message);
        return contactRequestRepository.save(contactRequest);
    }

    @GetMapping("/requests")
    public List<ContactRequest> getAllRequests() {
        return contactRequestRepository.findAll();
    }

    @PutMapping("/requests/{id}/status")
    public ContactRequest updateStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        String adminResponse = request.get("adminResponse");
        
        ContactRequest contactRequest = contactRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        contactRequest.setStatus(status);
        if (adminResponse != null) {
            contactRequest.setAdminResponse(adminResponse);
        }
        return contactRequestRepository.save(contactRequest);
    }

    @PutMapping("/requests/{id}/read")
    public ContactRequest markAsRead(@PathVariable("id") Long id) {
        ContactRequest contactRequest = contactRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        contactRequest.setReadByAnalyst(true);
        return contactRequestRepository.save(contactRequest);
    }

    @DeleteMapping("/requests/{id}")
    @CrossOrigin(origins = "*", methods = {RequestMethod.DELETE, RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.OPTIONS})
    @org.springframework.transaction.annotation.Transactional
    public org.springframework.http.ResponseEntity<?> deleteRequest(@PathVariable("id") Long id) {
        System.out.println(">>> CLASSIFIED DELETE REQUEST RECEIVED FOR ID: " + id);
        try {
            if (contactRequestRepository.existsById(id)) {
                contactRequestRepository.deleteById(id);
                System.out.println(">>> PURGE CONFIRMED AT DATA LAYER FOR ID: " + id);
                return org.springframework.http.ResponseEntity.ok().build();
            } else {
                System.out.println(">>> WARNING: RESOURCE ALREADY DELETED OR MISSING AT ID: " + id);
                return org.springframework.http.ResponseEntity.ok().build(); // Already gone is a success in our book
            }
        } catch (Exception e) {
            System.err.println(">>> INFRASTRUCTURE ERROR DURING PURGE: " + e.getMessage());
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500).body("Registry Access Denied: " + e.getMessage());
        }
    }
}
