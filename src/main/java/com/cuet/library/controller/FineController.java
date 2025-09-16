package com.cuet.library.controller;

import com.cuet.library.entity.Fine;
import com.cuet.library.entity.User;
import com.cuet.library.service.FineService;
import com.cuet.library.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fines")
@CrossOrigin(origins = "*")
public class FineController {
    
    @Autowired
    private FineService fineService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/{id}/pay")
    public ResponseEntity<Fine> payFine(@PathVariable Long id) {
        Fine fine = fineService.markFineAsPaid(id);
        return ResponseEntity.ok(fine);
    }
    
    @GetMapping("/user")
    public ResponseEntity<List<Fine>> getFinesByUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Fine> fines = fineService.getFinesByUser(user);
        return ResponseEntity.ok(fines);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Fine> getFineById(@PathVariable Long id) {
        Fine fine = fineService.getFineById(id).orElseThrow(() -> new RuntimeException("Fine not found"));
        return ResponseEntity.ok(fine);
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<List<Fine>> getAllFines() {
        List<Fine> fines = fineService.getAllFines();
        return ResponseEntity.ok(fines);
    }
    
    @GetMapping("/admin/unpaid")
    public ResponseEntity<List<Fine>> getUnpaidFines() {
        List<Fine> fines = fineService.getAllFines().stream()
            .filter(fine -> !fine.getPayment())
            .toList();
        return ResponseEntity.ok(fines);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFine(@PathVariable Long id) {
        fineService.deleteFine(id);
        return ResponseEntity.ok().build();
    }
}
