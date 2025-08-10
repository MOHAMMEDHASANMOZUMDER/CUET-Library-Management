package com.cuet.library.repository;

import com.cuet.library.entity.Note;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUser(User user);
    List<Note> findByBook(Book book);
    List<Note> findByStatus(Note.Status status);
    List<Note> findBySubject(String subject);
    
    @Query("SELECT n FROM Note n WHERE n.status = 'APPROVED' ORDER BY n.createdAt DESC")
    Page<Note> findApprovedNotes(Pageable pageable);
    
    @Query("SELECT n FROM Note n WHERE n.status = 'APPROVED' AND " +
           "(:subject IS NULL OR n.subject LIKE %:subject%) AND " +
           "(:title IS NULL OR n.title LIKE %:title%)")
    Page<Note> findApprovedNotesWithFilters(@Param("subject") String subject,
                                           @Param("title") String title,
                                           Pageable pageable);
    
    @Query("SELECT COUNT(n) FROM Note n WHERE n.status = 'PENDING'")
    long countPendingNotes();
    
    @Query("SELECT COUNT(n) FROM Note n WHERE n.status = 'APPROVED'")
    long countApprovedNotes();
}
