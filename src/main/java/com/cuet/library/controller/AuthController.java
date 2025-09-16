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
            String jwt = authService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
            User user = authService.getCurrentUser();
            return ResponseEntity.ok(new JwtResponse(jwt, user.getEmail(), user.getName(), user.getRole()));
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            // Incorrect email or password
            System.err.println("Login failed: bad credentials for email " + loginRequest.getEmail());
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                                 .body("Invalid email or password");
        } catch (Exception e) {
            // Unexpected errors
            e.printStackTrace();
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Authentication error: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            if (userService.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest().body("Email is already in use!");
            }
            // Register new user
            authService.registerUser(
                registerRequest.getName(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                registerRequest.getDepartment()
            );
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            e.printStackTrace();
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
