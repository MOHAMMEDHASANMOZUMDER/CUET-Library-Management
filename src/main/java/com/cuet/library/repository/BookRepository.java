package com.cuet.library.repository;

import com.cuet.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
    boolean existsByIsbn(String isbn);
    
    List<Book> findByDepartment(String department);
    List<Book> findByCategory(String category);
    List<Book> findByAvailableCopiesGreaterThan(Integer copies);
    
    @Query("SELECT b FROM Book b WHERE b.title LIKE %:keyword% OR b.isbn LIKE %:keyword%")
    Page<Book> findByTitleOrIsbnContaining(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE " +
           "(:title IS NULL OR b.title LIKE %:title%) AND " +
           "(:department IS NULL OR b.department = :department) AND " +
           "(:category IS NULL OR b.category = :category) AND " +
           "(:available IS NULL OR (:available = true AND b.availableCopies > 0) OR (:available = false))")
    Page<Book> findBooksWithFilters(@Param("title") String title,
                                   @Param("department") String department,
                                   @Param("category") String category,
                                   @Param("available") Boolean available,
                                   Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Book b")
    long countTotalBooks();
    
    @Query("SELECT COUNT(b) FROM Book b WHERE b.availableCopies > 0")
    long countAvailableBooks();
    
    @Query("SELECT b FROM Book b ORDER BY b.createdAt DESC")
    List<Book> findRecentBooks(Pageable pageable);
}
