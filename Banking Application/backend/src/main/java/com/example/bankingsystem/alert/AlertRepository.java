package com.example.bankingsystem.alert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByIsReadFalseOrderByCreatedAtDesc();
    List<Alert> findByAssignedToAndIsReadFalseOrderByCreatedAtDesc(String assignedTo);
    List<Alert> findBySeverityOrderByCreatedAtDesc(String severity);
    long countByIsReadFalse();
}
