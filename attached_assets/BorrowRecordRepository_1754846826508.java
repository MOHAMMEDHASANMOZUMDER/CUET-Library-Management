package com.cuet.library.repository;

import com.cuet.library.entity.BorrowRecord;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUser(User user);
    List<BorrowRecord> findByBook(Book book);
    List<BorrowRecord> findByStatus(BorrowRecord.Status status);
    
    @Query("SELECT br FROM BorrowRecord br WHERE br.user = :user AND br.status = :status")
    List<BorrowRecord> findByUserAndStatus(@Param("user") User user, @Param("status") BorrowRecord.Status status);
    
    @Query("SELECT br FROM BorrowRecord br WHERE br.dueDate < :date AND br.status = 'BORROWED'")
    List<BorrowRecord> findOverdueRecords(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.user = :user AND br.status = 'BORROWED'")
    long countActiveBorrowsByUser(@Param("user") User user);
    
    @Query("SELECT br FROM BorrowRecord br WHERE br.user = :user AND br.book = :book AND br.status = 'BORROWED'")
    List<BorrowRecord> findActiveBorrowRecord(@Param("user") User user, @Param("book") Book book);
    
    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.status = 'BORROWED'")
    long countActiveBorrows();
}
