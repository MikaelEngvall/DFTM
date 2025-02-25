package com.dftm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class RegisterRequest {
    @NotBlank(message = "{name.required}")
    private String name;

    @NotBlank(message = "{email.required}")
    @Email(message = "{email.invalid}")
    private String email;

    @NotBlank(message = "{password.required}")
    @Size(min = 6, message = "{password.length}")
    private String password;

    @NotNull(message = "{language.required}")
    private Language preferredLanguage;

    @Builder.Default
    private Role role = Role.ROLE_USER;
} 