package com.cuet.library.repository;

import com.cuet.library.entity.Fine;
import com.cuet.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByUser(User user);
    List<Fine> findByStatus(Fine.Status status);
    
    @Query("SELECT f FROM Fine f WHERE f.user = :user AND f.status = :status")
    List<Fine> findByUserAndStatus(@Param("user") User user, @Param("status") Fine.Status status);
    
    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.user = :user AND f.status = 'PENDING'")
    BigDecimal getTotalPendingFinesByUser(@Param("user") User user);
    
    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.status = 'PENDING'")
    BigDecimal getTotalPendingFines();
    
    @Query("SELECT COUNT(f) FROM Fine f WHERE f.status = 'PENDING'")
    long countPendingFines();
}
