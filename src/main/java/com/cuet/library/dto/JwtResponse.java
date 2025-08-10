package com.cuet.library.dto;

import com.cuet.library.entity.User;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String studentId;
    private String fullName;
    private User.Role role;

    // Constructors
    public JwtResponse() {}

    public JwtResponse(String token, String studentId, String fullName, User.Role role) {
        this.token = token;
        this.studentId = studentId;
        this.fullName = fullName;
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

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public User.Role getRole() {
        return role;
    }

    public void setRole(User.Role role) {
        this.role = role;
    }
}
