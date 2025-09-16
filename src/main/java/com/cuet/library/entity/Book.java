package com.cuet.library.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "books")
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Book_ID")
    private Long id;
    
    @Column(name = "Title", nullable = false)
    private String title;
    
    @Column(name = "Author", nullable = false)
    private String author;
    
    @Column(name = "Total_copies", nullable = false)
    private Integer totalCopies = 1;
    
    @Column(name = "Available_copies", nullable = false)
    private Integer availableCopies = 1;
    
    // Constructors
    public Book() {}
    
    public Book(String title, String author, Integer totalCopies) {
        this.title = title;
        this.author = author;
        this.totalCopies = totalCopies;
        this.availableCopies = totalCopies;
    }
    
    // Business methods
    public boolean isAvailable() {
        return availableCopies > 0;
    }
    
    public void borrowCopy() {
        if (availableCopies > 0) {
            availableCopies--;
        } else {
            throw new RuntimeException("No copies available");
        }
    }
    
    public void returnCopy() {
        if (availableCopies < totalCopies) {
            availableCopies++;
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public Integer getTotalCopies() {
        return totalCopies;
    }
    
    public void setTotalCopies(Integer totalCopies) {
        this.totalCopies = totalCopies;
    }
    
    public Integer getAvailableCopies() {
        return availableCopies;
    }
    
    public void setAvailableCopies(Integer availableCopies) {
        this.availableCopies = availableCopies;
    }
}
