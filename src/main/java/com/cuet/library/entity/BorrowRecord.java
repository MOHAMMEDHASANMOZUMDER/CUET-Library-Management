package com.cuet.library.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "borrow_records")
public class BorrowRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Borrow_ID")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "User_ID", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Book_ID", nullable = false)
    private Book book;
    
    @Column(name = "Borrow_date", nullable = false)
    private LocalDate borrowDate;
    
    @Column(name = "Due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "Return_date")
    private LocalDate returnDate;
    
    // Constructors
    public BorrowRecord() {}
    
    public BorrowRecord(User user, Book book) {
        this.user = user;
        this.book = book;
        this.borrowDate = LocalDate.now();
        this.dueDate = LocalDate.now().plusDays(14); // 14 days loan period
    }
    
    // Business methods
    public boolean isOverdue() {
        return returnDate == null && LocalDate.now().isAfter(dueDate);
    }
    
    public void returnBook() {
        this.returnDate = LocalDate.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Book getBook() {
        return book;
    }
    
    public void setBook(Book book) {
        this.book = book;
    }
    
    public LocalDate getBorrowDate() {
        return borrowDate;
    }
    
    public void setBorrowDate(LocalDate borrowDate) {
        this.borrowDate = borrowDate;
    }
    
    public LocalDate getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
    
    public LocalDate getReturnDate() {
        return returnDate;
    }
    
    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }
}
