package com.meena.frauddetection.controller;

import com.meena.frauddetection.model.User;
import com.meena.frauddetection.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend to connect
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void init() {
        // Pre-populate with default users if table is empty
        if (userRepository.count() == 0) {
            User admin = new User("Admin", "admin123", "fraudalerts123@gmail.com", "Admin", "ALL");
            userRepository.save(admin);

            User analyst = new User("analyst", "analyst123", "analyst@securepay.com", "Analyst", "READ_ONLY,VIEW_ALERTS");
            userRepository.save(analyst);
        }
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String role = request.getOrDefault("role", "Analyst");

        if (username == null || email == null || password == null) {
            throw new RuntimeException("All fields are required");
        }

        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
             throw new RuntimeException("Username or email already exists");
        }

        User newUser = new User(username, password, email, role, "READ_ONLY,VIEW_ALERTS");
        userRepository.save(newUser);

        // Map response
        Map<String, Object> response = new HashMap<>();
        Map<String, String> userResponse = new HashMap<>();
        userResponse.put("id", String.valueOf(newUser.getId()));
        userResponse.put("username", newUser.getUsername());
        userResponse.put("email", newUser.getEmail());
        userResponse.put("role", newUser.getRole());
        userResponse.put("permissions", newUser.getPermissions());
        
        response.put("user", userResponse);
        response.put("token", "mock-jwt-token-" + newUser.getId());

        return response;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            throw new RuntimeException("Username and password are required");
        }

        User user = userRepository.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        Map<String, Object> response = new HashMap<>();
        Map<String, String> userResponse = new HashMap<>();
        userResponse.put("id", String.valueOf(user.getId()));
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("role", user.getRole());
        userResponse.put("permissions", user.getPermissions());
        
        response.put("user", userResponse);
        response.put("token", "mock-jwt-token-" + user.getId());

        return response;
    }
}
