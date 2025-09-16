package com.cuet.library.controller;

import com.cuet.library.entity.BorrowRecord;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import com.cuet.library.service.BorrowService;
import com.cuet.library.service.BookService;
import com.cuet.library.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
@CrossOrigin(origins = "*")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @Autowired
    private BookService bookService;

    @Autowired
    private AuthService authService;

    @PostMapping("/book/{bookId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> borrowBook(@PathVariable Long bookId) {
        try {
            User user = authService.getCurrentUser();
            Book book = bookService.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Book not found"));
            
            BorrowRecord borrowRecord = borrowService.borrowBook(user, book);
            return ResponseEntity.ok(borrowRecord);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/return/{borrowRecordId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> returnBook(@PathVariable Long borrowRecordId) {
        try {
            BorrowRecord borrowRecord = borrowService.returnBook(borrowRecordId);
            return ResponseEntity.ok(borrowRecord);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-borrows")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowRecord>> getMyBorrows() {
        try {
            User user = authService.getCurrentUser();
            List<BorrowRecord> borrows = borrowService.getUserBorrowHistory(user);
            return ResponseEntity.ok(borrows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my-active-borrows")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowRecord>> getMyActiveBorrows() {
        try {
            User user = authService.getCurrentUser();
            List<BorrowRecord> activeBorrows = borrowService.getActiveBorrows(user);
            return ResponseEntity.ok(activeBorrows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BorrowRecord>> getOverdueRecords() {
        return ResponseEntity.ok(borrowService.getOverdueRecords());
    }

    @GetMapping("/stats/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getActiveBorrowCount() {
        return ResponseEntity.ok(borrowService.getActiveBorrowCount());
    }
}
