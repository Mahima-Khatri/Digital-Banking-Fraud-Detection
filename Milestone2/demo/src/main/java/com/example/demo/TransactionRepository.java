package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Query to count transactions in the last 1 minute for a specific sender
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.senderId = :senderId AND t.createdAt > :timeLimit")
    long countRecentTransactions(@Param("senderId") String senderId, @Param("timeLimit") LocalDateTime timeLimit);
}