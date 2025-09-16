package com.cuet.library.repository;

import com.cuet.library.entity.Fine;
import com.cuet.library.entity.User;
import com.cuet.library.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByUser(User user);
    
    List<Fine> findByBorrowRecord(BorrowRecord borrowRecord);
    
    List<Fine> findByPayment(Boolean payment);
    
    @Query("SELECT f FROM Fine f WHERE f.user = :user AND f.payment = :payment")
    List<Fine> findByUserAndPayment(@Param("user") User user, @Param("payment") Boolean payment);
    
    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.user = :user AND f.payment = false")
    BigDecimal getTotalUnpaidFinesByUser(@Param("user") User user);
    
    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.payment = false")
    BigDecimal getTotalUnpaidFines();
    
    @Query("SELECT COUNT(f) FROM Fine f WHERE f.payment = false")
    long countUnpaidFines();
}
