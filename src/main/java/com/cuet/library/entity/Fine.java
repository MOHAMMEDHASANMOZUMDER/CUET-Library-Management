package com.cuet.library.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "fines")
public class Fine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Fine_ID")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "User_ID", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Borrow_ID", nullable = false)
    private BorrowRecord borrowRecord;
    
    @Column(name = "Amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "Payment", nullable = false)
    private Boolean payment = false;
    
    // Constructors
    public Fine() {}
    
    public Fine(User user, BorrowRecord borrowRecord, BigDecimal amount) {
        this.user = user;
        this.borrowRecord = borrowRecord;
        this.amount = amount;
        this.payment = false;
    }
    
    // Business methods
    public void markAsPaid() {
        this.payment = true;
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
    
    public BorrowRecord getBorrowRecord() {
        return borrowRecord;
    }
    
    public void setBorrowRecord(BorrowRecord borrowRecord) {
        this.borrowRecord = borrowRecord;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public Boolean getPayment() {
        return payment;
    }
    
    public void setPayment(Boolean payment) {
        this.payment = payment;
    }
}
