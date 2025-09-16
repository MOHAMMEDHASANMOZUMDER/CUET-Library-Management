package com.cuet.library.repository;

import com.cuet.library.entity.Note;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUser(User user);
    List<Note> findByBook(Book book);
}
