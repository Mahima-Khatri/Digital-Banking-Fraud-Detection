package com.meena.frauddetection.repository;

import com.meena.frauddetection.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<PaymentTransaction, Long> {
}
