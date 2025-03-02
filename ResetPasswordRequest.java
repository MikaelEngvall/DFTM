package com.dftm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    
    @NotBlank(message = "E-post får inte vara tom")
    @Email(message = "Ogiltig e-postadress")
    private String email;
    
    @NotBlank(message = "Lösenord får inte vara tomt")
    @Size(min = 8, message = "Lösenordet måste vara minst 8 tecken")
    private String newPassword;
    
    public ResetPasswordRequest() {
    }
    
    public ResetPasswordRequest(String email, String newPassword) {
        this.email = email;
        this.newPassword = newPassword;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
} 