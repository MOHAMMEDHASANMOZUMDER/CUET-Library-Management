package com.cuet.library.service;

import com.cuet.library.entity.Note;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import com.cuet.library.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    public Note createNote(User user, Book book) {
        Note note = new Note(user, book);
        return noteRepository.save(note);
    }
    
    public List<Note> getNotesByUser(User user) {
        return noteRepository.findByUser(user);
    }
    
    public List<Note> getNotesByBook(Book book) {
        return noteRepository.findByBook(book);
    }
    
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }
    
    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }
    
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }
}
