package com.dftm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.dto.CreateUserRequest;
import com.dftm.dto.UpdateProfileRequest;
import com.dftm.dto.UserResponse;
import com.dftm.exception.BadRequestException;
import com.dftm.exception.ResourceNotFoundException;
import com.dftm.model.User;
import com.dftm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Fetching all users");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("User authorities: {}", auth.getAuthorities());
        
        List<UserResponse> users = userRepository.findAll().stream()
            .map(user -> UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        
        log.info("Found {} users", users.size());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/test")
    public ResponseEntity<List<User>> testGetAllUsers() {
        List<User> users = userRepository.findAll();
        log.info("Test endpoint - Found {} users", users.size());
        log.info("Test endpoint - Users: {}", users);
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<UserResponse> toggleUserStatus(
        @PathVariable String id,
        @RequestBody Map<String, Boolean> status
    ) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setActive(status.get("active"));
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        return ResponseEntity.ok(UserResponse.builder()
            .id(savedUser.getId())
            .name(savedUser.getName())
            .email(savedUser.getEmail())
            .role(savedUser.getRole())
            .active(savedUser.isActive())
            .createdAt(savedUser.getCreatedAt())
            .build());
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return ResponseEntity.ok(UserResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
        @RequestBody UpdateProfileRequest request,
        Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Validera lösenord om det finns med i requesten
        if (request.getCurrentPassword() != null && !request.getCurrentPassword().isEmpty()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadCredentialsException("Invalid current password");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        return ResponseEntity.ok(UserResponse.builder()
            .id(savedUser.getId())
            .name(savedUser.getName())
            .email(savedUser.getEmail())
            .role(savedUser.getRole())
            .active(savedUser.isActive())
            .createdAt(savedUser.getCreatedAt())
            .build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole())
            .active(true)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        User savedUser = userRepository.save(user);
        
        return ResponseEntity.ok(UserResponse.builder()
            .id(savedUser.getId())
            .name(savedUser.getName())
            .email(savedUser.getEmail())
            .role(savedUser.getRole())
            .active(savedUser.isActive())
            .createdAt(savedUser.getCreatedAt())
            .build());
    }
} 