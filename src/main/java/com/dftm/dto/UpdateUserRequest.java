package com.dftm.dto;

import com.dftm.model.Language;
import com.dftm.model.Role;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
    private Language preferredLanguage;
    private Boolean active;
} 