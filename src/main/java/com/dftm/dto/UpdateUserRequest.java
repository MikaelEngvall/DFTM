package com.dftm.dto;

import com.dftm.model.Language;
import com.dftm.model.Role;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private Role role;
    private Language preferredLanguage;
    private Boolean active;
} 