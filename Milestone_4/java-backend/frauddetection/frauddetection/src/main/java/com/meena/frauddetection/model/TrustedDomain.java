package com.meena.frauddetection.model;

import jakarta.persistence.*;

@Entity
@Table(name = "trusted_domains")
public class TrustedDomain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String domain; // e.g., @securepay.com

    public TrustedDomain() {}

    public TrustedDomain(String domain) {
        this.domain = domain;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
}
