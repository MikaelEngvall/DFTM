package com.dftm.dto;

import com.dftm.model.Role;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
} 