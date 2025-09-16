package com.cuet.library.repository;

import com.cuet.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByAuthor(String author);
    List<Book> findByAvailableCopiesGreaterThan(Integer copies);
    
    @Query("SELECT b FROM Book b WHERE b.title LIKE %:keyword% OR b.author LIKE %:keyword%")
    Page<Book> findByTitleOrAuthorContaining(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE " +
           "(:title IS NULL OR b.title LIKE %:title%) AND " +
           "(:author IS NULL OR b.author LIKE %:author%) AND " +
           "(:available IS NULL OR (:available = true AND b.availableCopies > 0) OR (:available = false))")
    Page<Book> findBooksWithFilters(@Param("title") String title,
                                   @Param("author") String author,
                                   @Param("available") Boolean available,
                                   Pageable pageable);
    
    long countByAvailableCopiesGreaterThan(Integer copies);
}
