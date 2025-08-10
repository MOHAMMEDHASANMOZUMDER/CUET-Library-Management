package com.cuet.library.repository;

import com.cuet.library.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    
    @Query("SELECT c FROM Category c ORDER BY c.name")
    List<Category> findAllOrderByName();
    
    @Query("SELECT c FROM Category c JOIN c.books b GROUP BY c ORDER BY COUNT(b) DESC")
    List<Category> findCategoriesOrderByBookCount();
}
