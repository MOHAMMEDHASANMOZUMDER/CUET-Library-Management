package com.cuet.library.dto;

import com.cuet.library.entity.User;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String name;
    private User.Role role;

    // Constructors
    public JwtResponse() {}

    public JwtResponse(String token, String email, String name, User.Role role) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User.Role getRole() {
        return role;
    }

    public void setRole(User.Role role) {
        this.role = role;
    }
}
