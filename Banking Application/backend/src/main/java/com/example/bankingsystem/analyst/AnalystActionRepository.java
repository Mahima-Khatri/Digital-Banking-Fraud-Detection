package com.example.bankingsystem.analyst;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalystActionRepository extends JpaRepository<AnalystAction, Long> {
    List<AnalystAction> findByTransactionIdOrderByActionTimeDesc(String transactionId);
    List<AnalystAction> findByAnalystUsernameOrderByActionTimeDesc(String analystUsername);
}
