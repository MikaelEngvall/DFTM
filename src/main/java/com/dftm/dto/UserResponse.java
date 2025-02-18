package com.dftm.dto;

import java.time.LocalDateTime;
import com.dftm.model.Role;
import com.dftm.model.Language;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private Language preferredLanguage;
    private LocalDateTime createdAt;
} 