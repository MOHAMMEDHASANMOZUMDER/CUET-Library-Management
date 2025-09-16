package com.cuet.library.controller;

import com.cuet.library.entity.PreBook;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import com.cuet.library.service.PreBookService;
import com.cuet.library.service.UserService;
import com.cuet.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prebooks")
@CrossOrigin(origins = "*")
public class PreBookController {
    
    @Autowired
    private PreBookService preBookService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookService bookService;
    
    @PostMapping
    public ResponseEntity<PreBook> createPreBook(@RequestParam Long bookId, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookService.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));
        
        PreBook preBook = preBookService.createPreBook(user, book);
        return ResponseEntity.ok(preBook);
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<PreBook> approvePreBook(@PathVariable Long id) {
        PreBook preBook = preBookService.approvePreBook(id);
        return ResponseEntity.ok(preBook);
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<PreBook> rejectPreBook(@PathVariable Long id) {
        PreBook preBook = preBookService.rejectPreBook(id);
        return ResponseEntity.ok(preBook);
    }
    
    @GetMapping("/user")
    public ResponseEntity<List<PreBook>> getPreBooksByUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        List<PreBook> preBooks = preBookService.getPreBooksByUser(user);
        return ResponseEntity.ok(preBooks);
    }
    
    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<PreBook>> getPreBooksByBook(@PathVariable Long bookId) {
        Book book = bookService.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));
        List<PreBook> preBooks = preBookService.getPreBooksByBook(book);
        return ResponseEntity.ok(preBooks);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PreBook>> getPreBooksByStatus(@PathVariable PreBook.Status status) {
        List<PreBook> preBooks = preBookService.getPreBooksByStatus(status);
        return ResponseEntity.ok(preBooks);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PreBook> getPreBookById(@PathVariable Long id) {
        PreBook preBook = preBookService.getPreBookById(id).orElseThrow(() -> new RuntimeException("PreBook not found"));
        return ResponseEntity.ok(preBook);
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<List<PreBook>> getAllPreBooks() {
        List<PreBook> preBooks = preBookService.getAllPreBooks();
        return ResponseEntity.ok(preBooks);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreBook(@PathVariable Long id) {
        preBookService.deletePreBook(id);
        return ResponseEntity.ok().build();
    }
}
