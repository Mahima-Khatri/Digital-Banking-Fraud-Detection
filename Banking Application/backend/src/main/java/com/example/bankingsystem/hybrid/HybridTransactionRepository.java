package com.example.bankingsystem.hybrid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HybridTransactionRepository extends JpaRepository<HybridTransaction, Long> {
    Optional<HybridTransaction> findByTransactionId(String transactionId);
    Page<HybridTransaction> findByRiskLevel(String riskLevel, Pageable pageable);
    Page<HybridTransaction> findByStatus(String status, Pageable pageable);
    Page<HybridTransaction> findByTransactionIdContainingOrUserIdContaining(
        String transactionId, String userId, Pageable pageable
    );
}
