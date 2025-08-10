package com.cuet.library.service;

import com.cuet.library.entity.User;
import com.cuet.library.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    public String authenticateUser(String studentId, String password) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(studentId, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.generateToken(authentication);
    }

    public User registerUser(String studentId, String name, String email, String password, 
                           String department, String session) {
        User user = new User(studentId, name, email, password, department, session);
        return userService.createUser(user);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String studentId = authentication.getName();
            return userService.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("No authenticated user found");
    }

    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    public String getUsernameFromToken(String token) {
        return tokenProvider.getUsernameFromToken(token);
    }
}
