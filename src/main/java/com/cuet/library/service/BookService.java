package com.cuet.library.service;

import com.cuet.library.entity.Book;
import com.cuet.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public Page<Book> findAllPaginated(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }

    public List<Book> findByAuthor(String author) {
        return bookRepository.findByAuthor(author);
    }

    public List<Book> findAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }

    public Page<Book> searchBooks(String keyword, Pageable pageable) {
        return bookRepository.findByTitleOrAuthorContaining(keyword, pageable);
    }

    public Page<Book> findBooksWithFilters(String title, String author, Boolean available, Pageable pageable) {
        return bookRepository.findBooksWithFilters(title, author, available, pageable);
    }

    public Book updateBook(Book book) {
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    public long getTotalBookCount() {
        return bookRepository.count();
    }

    public long getAvailableBookCount() {
        return bookRepository.countByAvailableCopiesGreaterThan(0);
    }

    public Book borrowBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (!book.isAvailable()) {
            throw new RuntimeException("Book is not available");
        }
        
        book.borrowCopy();
        return bookRepository.save(book);
    }

    public Book returnBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        book.returnCopy();
        return bookRepository.save(book);
    }

    public Book updateBookCopies(Long bookId, Integer totalCopies, Integer availableCopies) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(availableCopies);
        return bookRepository.save(book);
    }
}
