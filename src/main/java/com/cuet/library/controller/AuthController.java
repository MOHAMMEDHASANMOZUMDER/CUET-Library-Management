package com.cuet.library.controller;

import com.cuet.library.dto.JwtResponse;
import com.cuet.library.dto.LoginRequest;
import com.cuet.library.dto.RegisterRequest;
import com.cuet.library.entity.User;
import com.cuet.library.service.AuthService;
import com.cuet.library.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            String jwt = authService.authenticateUser(loginRequest.getStudentId(), loginRequest.getPassword());
            User user = authService.getCurrentUser();
            
            return ResponseEntity.ok(new JwtResponse(jwt, user.getStudentId(), user.getFullName(), user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            if (userService.existsByStudentId(registerRequest.getStudentId())) {
                return ResponseEntity.badRequest().body("Student ID is already taken!");
            }

            if (userService.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest().body("Email is already in use!");
            }

            User user = authService.registerUser(
                registerRequest.getStudentId(),
                registerRequest.getFullName(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                registerRequest.getDepartment(),
                registerRequest.getSession()
            );

            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User user = authService.getCurrentUser();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("User not found");
        }
    }
}
