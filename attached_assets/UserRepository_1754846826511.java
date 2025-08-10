package com.cuet.library.repository;

import com.cuet.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByStudentId(String studentId);
    Optional<User> findByEmail(String email);
    boolean existsByStudentId(String studentId);
    boolean existsByEmail(String email);
    
    List<User> findByRole(User.Role role);
    List<User> findByDepartment(String department);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.enabled = true")
    List<User> findActiveUsersByRole(@Param("role") User.Role role);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'STUDENT'")
    long countStudents();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'STUDENT' AND u.enabled = true")
    long countActiveStudents();
}
