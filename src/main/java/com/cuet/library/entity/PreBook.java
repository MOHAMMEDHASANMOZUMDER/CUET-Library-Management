package com.cuet.library.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pre_books")
public class PreBook {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Pre_book_ID")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "User_ID", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Book_ID", nullable = false)
    private Book book;
    
    @Column(name = "Request_date", nullable = false)
    private LocalDate requestDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private Status status = Status.PENDING;
    
    public enum Status {
        PENDING, APPROVED, REJECTED
    }
    
    // Constructors
    public PreBook() {}
    
    public PreBook(User user, Book book) {
        this.user = user;
        this.book = book;
        this.requestDate = LocalDate.now();
        this.status = Status.PENDING;
    }
    
    // Business methods
    public void approve() {
        this.status = Status.APPROVED;
    }
    
    public void reject() {
        this.status = Status.REJECTED;
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
    
    public LocalDate getRequestDate() {
        return requestDate;
    }
    
    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
}
