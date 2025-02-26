package com.dftm.controller;

<<<<<<< HEAD
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.dftm.dto.UpdateUserRequest;
import com.dftm.model.Language;
import com.dftm.model.Role;
import com.dftm.model.User;
import com.dftm.service.UserService;

import jakarta.validation.Valid;
=======
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

>>>>>>> da99129625826e73133cdac6490346b8c8af8627
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
<<<<<<< HEAD

    private final UserService userService;
    private final MessageSource messageSource;

    private String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    private User translateUser(User user) {
        user.setRoleDisplay(getMessage("role." + user.getRole().name()));
        return user;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        log.debug("GET request to fetch all users");
        List<User> users = userService.getAllUsers().stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        log.debug("GET request to fetch user with ID: {}", userId);
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(translateUser(user));
    }

    @GetMapping("/language/{language}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByLanguage(@PathVariable Language language) {
        log.debug("GET request to fetch users with language: {}", language);
        List<User> users = userService.getUsersByLanguage(language).stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> getActiveUsers() {
        log.debug("GET request to fetch active users");
        List<User> users = userService.getActiveUsers().stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByName(@RequestParam String name) {
        log.debug("GET request to fetch users with name containing: {}", name);
        List<User> users = userService.getUsersByName(name).stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        log.debug("GET request to fetch users with role: {}", role);
        List<User> users = userService.getUsersByRole(role).stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<User> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRequest request) {
        log.debug("PATCH request to update user with ID: {}", userId);
        User updatedUser = userService.updateUser(userId, request);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("user.updated"))
            .body(translateUser(updatedUser));
=======
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Attempting to fetch all users. Current user authorities: {}", 
            SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        try {
            List<User> users = userRepository.findAll();
            log.info("Successfully fetched {} users", users.size());
            return ResponseEntity.ok(users.stream()
                .map(user -> UserResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .preferredLanguage(user.getPreferredLanguage())
                    .active(user.isActive())
                    .createdAt(user.getCreatedAt())
                    .build())
                .collect(Collectors.toList()));
        } catch (Exception e) {
            log.error("Failed to fetch users: {}", e.getMessage());
            throw e;
        }
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
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        log.info("Attempting to create new user. Current user authorities: {}", 
            SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        try {
            // Kontrollera om e-postadressen redan finns
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }

            User newUser = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole())
                    .preferredLanguage(request.getPreferredLanguage())
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            User savedUser = userRepository.save(newUser);
            log.info("Successfully created new user with email: {}", savedUser.getEmail());

            return ResponseEntity.ok(UserResponse.builder()
                    .id(savedUser.getId())
                    .name(savedUser.getName())
                    .email(savedUser.getEmail())
                    .role(savedUser.getRole())
                    .preferredLanguage(savedUser.getPreferredLanguage())
                    .active(savedUser.isActive())
                    .createdAt(savedUser.getCreatedAt())
                    .build());
        } catch (Exception e) {
            log.error("Failed to create user: {}", e.getMessage());
            throw e;
        }
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
    }
} 