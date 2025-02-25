package com.dftm.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.dto.UpdateUserRequest;
import com.dftm.model.Language;
import com.dftm.model.Role;
import com.dftm.model.User;
import com.dftm.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        log.debug("GET request to fetch all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        log.debug("GET request to fetch user with ID: {}", userId);
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/language/{language}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByLanguage(@PathVariable Language language) {
        log.debug("GET request to fetch users with language: {}", language);
        return ResponseEntity.ok(userService.getUsersByLanguage(language));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<User>> getActiveUsers() {
        log.debug("GET request to fetch active users");
        return ResponseEntity.ok(userService.getActiveUsers());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByName(@RequestParam String name) {
        log.debug("GET request to fetch users with name containing: {}", name);
        return ResponseEntity.ok(userService.getUsersByName(name));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        log.debug("GET request to fetch users with role: {}", role);
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @PatchMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<User> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRequest request) {
        log.debug("PATCH request to update user with ID: {}", userId);
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }
} 