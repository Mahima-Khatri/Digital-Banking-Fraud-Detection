package com.example.bankingsystem.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRiskProfileRepository extends JpaRepository<UserRiskProfile, Long> {
    Optional<UserRiskProfile> findByUserId(String userId);
    List<UserRiskProfile> findByRiskLevelOrderByRiskScoreDesc(String riskLevel);
}
