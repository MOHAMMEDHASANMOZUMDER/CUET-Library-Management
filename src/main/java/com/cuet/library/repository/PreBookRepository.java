package com.cuet.library.repository;

import com.cuet.library.entity.PreBook;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreBookRepository extends JpaRepository<PreBook, Long> {
    
    List<PreBook> findByUser(User user);
    
    List<PreBook> findByBook(Book book);
    
    List<PreBook> findByStatus(PreBook.Status status);
    
    @Query("SELECT pb FROM PreBook pb WHERE pb.user.id = :userId")
    List<PreBook> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT pb FROM PreBook pb WHERE pb.book.id = :bookId")
    List<PreBook> findByBookId(@Param("bookId") Long bookId);
}
