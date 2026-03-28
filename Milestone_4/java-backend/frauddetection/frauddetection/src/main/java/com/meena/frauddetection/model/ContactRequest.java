package com.meena.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_requests")
public class ContactRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private LocalDateTime requestTime;

    @Column(nullable = false)
    private String status; // PENDING, PROCESSED, IGNORED

    @Column(length = 2000)
    private String adminResponse;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean readByAnalyst;

    public ContactRequest() {
        this.requestTime = LocalDateTime.now();
        this.status = "PENDING";
        this.readByAnalyst = false;
    }

    public ContactRequest(String name, String email, String message) {
        this();
        this.name = name;
        this.email = email;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getRequestTime() { return requestTime; }
    public void setRequestTime(LocalDateTime requestTime) { this.requestTime = requestTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }

    public boolean isReadByAnalyst() { return readByAnalyst; }
    public void setReadByAnalyst(boolean readByAnalyst) { this.readByAnalyst = readByAnalyst; }
}
