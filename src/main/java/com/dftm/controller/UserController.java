package com.dftm.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.dto.UpdateUserRequest;
import com.dftm.model.Language;
import com.dftm.model.Role;
import com.dftm.model.User;
import com.dftm.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final MessageSource messageSource;

    private String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    private User translateUser(User user) {
        user.setRoleDisplay(getMessage("role." + user.getRole().name()));
        return user;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        log.debug("GET request to fetch all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        log.debug("GET request to fetch user with ID: {}", userId);
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(translateUser(user));
    }

    @GetMapping("/language/{language}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByLanguage(@PathVariable Language language) {
        log.debug("GET request to fetch users with language: {}", language);
        List<User> users = userService.getUsersByLanguage(language).stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> getActiveUsers() {
        log.debug("GET request to fetch active users");
        List<User> users = userService.getActiveUsers().stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        log.debug("GET request to search users with query: {}", query);
        List<User> users = userService.searchUsersByName(query).stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        log.debug("GET request to fetch users with role: {}", role);
        List<User> users = userService.getUsersByRole(role).stream()
            .map(this::translateUser)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<User> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRequest request) {
        log.debug("PATCH request to update user with ID: {}", userId);
        User updatedUser = userService.updateUser(userId, request);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("user.updated"))
            .body(translateUser(updatedUser));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")
    public ResponseEntity<User> createUser(@Valid @RequestBody UpdateUserRequest request) {
        log.debug("POST request to create new user");
        User createdUser = userService.createUser(request);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("user.created"))
            .body(translateUser(createdUser));
    }
} 