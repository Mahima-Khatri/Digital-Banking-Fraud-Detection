package com.meena.frauddetection.repository;

import com.meena.frauddetection.model.ContactRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {
    List<ContactRequest> findByStatus(String status);
}
