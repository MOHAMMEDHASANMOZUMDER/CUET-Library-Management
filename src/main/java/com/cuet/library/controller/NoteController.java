package com.cuet.library.controller;

import com.cuet.library.entity.Note;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import com.cuet.library.service.NoteService;
import com.cuet.library.service.UserService;
import com.cuet.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteController {
    
    @Autowired
    private NoteService noteService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookService bookService;
    
    @PostMapping
    public ResponseEntity<Note> createNote(@RequestParam Long bookId, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookService.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));
        
        Note note = noteService.createNote(user, book);
        return ResponseEntity.ok(note);
    }
    
    @GetMapping("/user")
    public ResponseEntity<List<Note>> getNotesByUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Note> notes = noteService.getNotesByUser(user);
        return ResponseEntity.ok(notes);
    }
    
    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Note>> getNotesByBook(@PathVariable Long bookId) {
        Book book = bookService.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));
        List<Note> notes = noteService.getNotesByBook(book);
        return ResponseEntity.ok(notes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        Note note = noteService.getNoteById(id).orElseThrow(() -> new RuntimeException("Note not found"));
        return ResponseEntity.ok(note);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<List<Note>> getAllNotes() {
        List<Note> notes = noteService.getAllNotes();
        return ResponseEntity.ok(notes);
    }
}
