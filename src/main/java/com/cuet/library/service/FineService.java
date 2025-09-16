package com.cuet.library.service;

import com.cuet.library.entity.Fine;
import com.cuet.library.entity.User;
import com.cuet.library.entity.BorrowRecord;
import com.cuet.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class FineService {
    
    @Autowired
    private FineRepository fineRepository;
    
    public Fine createFine(User user, BorrowRecord borrowRecord, BigDecimal amount) {
        Fine fine = new Fine(user, borrowRecord, amount);
        return fineRepository.save(fine);
    }
    
    public Fine markFineAsPaid(Long fineId) {
        Optional<Fine> fineOpt = fineRepository.findById(fineId);
        if (fineOpt.isPresent()) {
            Fine fine = fineOpt.get();
            fine.markAsPaid();
            return fineRepository.save(fine);
        }
        throw new RuntimeException("Fine not found");
    }
    
    public List<Fine> getFinesByUser(User user) {
        return fineRepository.findByUser(user);
    }
    
    public List<Fine> getFinesByBorrowRecord(BorrowRecord borrowRecord) {
        return fineRepository.findByBorrowRecord(borrowRecord);
    }
    
    public Optional<Fine> getFineById(Long id) {
        return fineRepository.findById(id);
    }
    
    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }
    
    public void deleteFine(Long id) {
        fineRepository.deleteById(id);
    }
}
