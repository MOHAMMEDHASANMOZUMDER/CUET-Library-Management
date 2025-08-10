package com.cuet.library.dto;

public class LoginRequest {
    private String studentId;
    private String password;

    // Constructors
    public LoginRequest() {}

    public LoginRequest(String studentId, String password) {
        this.studentId = studentId;
        this.password = password;
    }

    // Getters and Setters
    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
