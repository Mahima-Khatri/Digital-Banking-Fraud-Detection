package com.meena.frauddetection.controller;

import com.meena.frauddetection.model.User;
import com.meena.frauddetection.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.meena.frauddetection.service.EmailService emailService;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Operational ID (Username) already registered in high-security registry.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Communication channel (Email) already assigned to another operative.");
        }
        
        User savedUser = userRepository.save(user);
        
        // Automated notification for new analysts/admins
        emailService.sendWelcomeEmail(
            savedUser.getEmail(), 
            savedUser.getUsername(), 
            savedUser.getRole(), 
            savedUser.getPassword()
        );
        
        return savedUser;
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable("id") Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(userDetails.getPassword());
        }
        user.setRole(userDetails.getRole());
        user.setPermissions(userDetails.getPermissions());
        
        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable("id") Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole().equals("Admin") && userRepository.count() <= 1) {
            throw new RuntimeException("Cannot delete the last administrator");
        }
        
        System.out.println(">>> CLASSIFIED DELETION INITIATED FOR OPERATIVE ID: " + id);
        userRepository.delete(user);
        System.out.println(">>> AUDIT LOG: Personnel record " + user.getUsername() + " successfully purged from database.");
    }
}
