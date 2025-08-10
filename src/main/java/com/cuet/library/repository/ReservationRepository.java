package com.cuet.library.repository;

import com.cuet.library.entity.Reservation;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUser(User user);
    List<Reservation> findByBook(Book book);
    List<Reservation> findByStatus(Reservation.Status status);
    
    @Query("SELECT r FROM Reservation r WHERE r.user = :user AND r.status = :status")
    List<Reservation> findByUserAndStatus(@Param("user") User user, @Param("status") Reservation.Status status);
    
    @Query("SELECT r FROM Reservation r WHERE r.expiresAt < :dateTime AND r.status = 'ACTIVE'")
    List<Reservation> findExpiredReservations(@Param("dateTime") LocalDateTime dateTime);
    
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user = :user AND r.status = 'ACTIVE'")
    long countActiveReservationsByUser(@Param("user") User user);
    
    @Query("SELECT r FROM Reservation r WHERE r.user = :user AND r.book = :book AND r.status = 'ACTIVE'")
    List<Reservation> findActiveReservation(@Param("user") User user, @Param("book") Book book);
}
