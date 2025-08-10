package com.cuet.library.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "borrow_records")
public class BorrowRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @Column(name = "borrow_date", nullable = false)
    private LocalDate borrowDate;
    
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "return_date")
    private LocalDate returnDate;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.BORROWED;
    
    @Column(name = "renewal_count")
    private Integer renewalCount = 0;
    
    @Column(name = "max_renewals")
    private Integer maxRenewals = 2;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum Status {
        BORROWED, RETURNED, OVERDUE, LOST
    }
    
    // Constructors
    public BorrowRecord() {}
    
    public BorrowRecord(User user, Book book) {
        this.user = user;
        this.book = book;
        this.borrowDate = LocalDate.now();
        this.dueDate = LocalDate.now().plusDays(14); // 14 days loan period
        this.status = Status.BORROWED;
        this.renewalCount = 0;
        this.maxRenewals = 2;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Business methods
    public boolean canRenew() {
        return status == Status.BORROWED && renewalCount < maxRenewals && !isOverdue();
    }
    
    public void renew() {
        if (canRenew()) {
            this.dueDate = this.dueDate.plusDays(14);
            this.renewalCount++;
            this.updatedAt = LocalDateTime.now();
        } else {
            throw new RuntimeException("Cannot renew this book");
        }
    }
    
    public boolean isOverdue() {
        return status == Status.BORROWED && LocalDate.now().isAfter(dueDate);
    }
    
    public long getDaysOverdue() {
        if (isOverdue()) {
            return ChronoUnit.DAYS.between(dueDate, LocalDate.now());
        }
        return 0;
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
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public Integer getRenewalCount() {
        return renewalCount;
    }
    
    public void setRenewalCount(Integer renewalCount) {
        this.renewalCount = renewalCount;
    }
    
    public Integer getMaxRenewals() {
        return maxRenewals;
    }
    
    public void setMaxRenewals(Integer maxRenewals) {
        this.maxRenewals = maxRenewals;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
