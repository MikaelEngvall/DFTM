package com.dftm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.dftm.model.Language;
import com.dftm.model.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    private String name;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
    
    private Role role;
    private Language preferredLanguage;
    private Boolean active;
} 