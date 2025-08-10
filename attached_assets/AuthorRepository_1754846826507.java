package com.cuet.library.repository;

import com.cuet.library.entity.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
    Optional<Author> findByName(String name);
    
    List<Author> findByNationality(String nationality);
    
    @Query("SELECT a FROM Author a WHERE a.name LIKE %:name%")
    Page<Author> findByNameContaining(@Param("name") String name, Pageable pageable);
    
    @Query("SELECT a FROM Author a WHERE a.birthYear BETWEEN :startYear AND :endYear")
    List<Author> findByBirthYearBetween(@Param("startYear") Integer startYear, @Param("endYear") Integer endYear);
}
