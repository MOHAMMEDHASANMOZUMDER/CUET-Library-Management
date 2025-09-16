package com.cuet.library.service;

import com.cuet.library.entity.PreBook;
import com.cuet.library.entity.User;
import com.cuet.library.entity.Book;
import com.cuet.library.repository.PreBookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PreBookService {
    
    @Autowired
    private PreBookRepository preBookRepository;
    
    public PreBook createPreBook(User user, Book book) {
        PreBook preBook = new PreBook(user, book);
        return preBookRepository.save(preBook);
    }
    
    public PreBook approvePreBook(Long preBookId) {
        Optional<PreBook> preBookOpt = preBookRepository.findById(preBookId);
        if (preBookOpt.isPresent()) {
            PreBook preBook = preBookOpt.get();
            preBook.approve();
            return preBookRepository.save(preBook);
        }
        throw new RuntimeException("PreBook not found");
    }
    
    public PreBook rejectPreBook(Long preBookId) {
        Optional<PreBook> preBookOpt = preBookRepository.findById(preBookId);
        if (preBookOpt.isPresent()) {
            PreBook preBook = preBookOpt.get();
            preBook.reject();
            return preBookRepository.save(preBook);
        }
        throw new RuntimeException("PreBook not found");
    }
    
    public List<PreBook> getPreBooksByUser(User user) {
        return preBookRepository.findByUser(user);
    }
    
    public List<PreBook> getPreBooksByBook(Book book) {
        return preBookRepository.findByBook(book);
    }
    
    public List<PreBook> getPreBooksByStatus(PreBook.Status status) {
        return preBookRepository.findByStatus(status);
    }
    
    public Optional<PreBook> getPreBookById(Long id) {
        return preBookRepository.findById(id);
    }
    
    public List<PreBook> getAllPreBooks() {
        return preBookRepository.findAll();
    }
    
    public void deletePreBook(Long id) {
        preBookRepository.deleteById(id);
    }
}
