package com.dftm.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dftm.dto.UpdateUserRequest;
import com.dftm.exception.EmailAlreadyExistsException;
import com.dftm.exception.UnauthorizedAccessException;
import com.dftm.model.Language;
import com.dftm.model.Role;
import com.dftm.model.User;
import com.dftm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll();
    }

    public User getUserById(String userId) {
        log.debug("Fetching user with ID: {}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getUsersByLanguage(Language language) {
        log.debug("Fetching users with language: {}", language);
        return userRepository.findByPreferredLanguage(language);
    }

    public List<User> getActiveUsers() {
        log.debug("Fetching active users");
        return userRepository.findByActiveTrue();
    }

    public List<User> searchUsersByName(String searchTerm) {
        log.debug("Fetching users with name containing: {}", searchTerm);
        return userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(searchTerm, searchTerm);
    }

    public List<User> getUsersByRole(Role role) {
        log.debug("Fetching users with role: {}", role);
        return userRepository.findByRole(role);
    }

    public User updateUser(String userId, UpdateUserRequest request) {
        log.debug("Attempting to update user with ID: {}", userId);
        
        // Hämta den inloggade användaren
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Hämta användaren som ska uppdateras
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Kontrollera behörigheter
        if (!hasPermissionToEdit(currentUser, userToUpdate)) {
            log.error("User {} does not have permission to edit user {}", currentUser.getEmail(), userToUpdate.getEmail());
            throw new UnauthorizedAccessException("You do not have permission to edit this user");
        }

        // Kontrollera om e-postadressen redan finns (om den ändras)
        if (request.getEmail() != null && !request.getEmail().equals(userToUpdate.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        // Uppdatera fälten om de finns i requesten
        if (request.getFirstName() != null) {
            userToUpdate.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            userToUpdate.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            userToUpdate.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            userToUpdate.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getPhoneNumber() != null) {
            userToUpdate.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getRole() != null) {
            // Extra kontroll för rolluppdateringar
            if (canChangeRole(currentUser, userToUpdate, request.getRole())) {
                userToUpdate.setRole(request.getRole());
            } else {
                throw new UnauthorizedAccessException("You do not have permission to change to this role");
            }
        }
        if (request.getPreferredLanguage() != null) {
            userToUpdate.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getActive() != null) {
            userToUpdate.setActive(request.getActive());
        }

        userToUpdate.setUpdatedAt(LocalDateTime.now().toString());
        
        User updatedUser = userRepository.save(userToUpdate);
        log.debug("Successfully updated user: {}", updatedUser.getEmail());
        
        return updatedUser;
    }

    private boolean hasPermissionToEdit(User editor, User target) {
        // SUPERADMIN kan redigera alla
        if (editor.getRole() == Role.ROLE_SUPERADMIN) {
            return true;
        }
        
        // ADMIN kan redigera alla förutom SUPERADMIN
        if (editor.getRole() == Role.ROLE_ADMIN) {
            return target.getRole() != Role.ROLE_SUPERADMIN;
        }
        
        // USER kan bara redigera sig själv
        return editor.getRole() == Role.ROLE_USER && editor.getId().equals(target.getId());
    }

    private boolean canChangeRole(User editor, User target, Role newRole) {
        // SUPERADMIN kan ändra till vilken roll som helst
        if (editor.getRole() == Role.ROLE_SUPERADMIN) {
            return true;
        }
        
        // ADMIN kan inte ändra till eller från SUPERADMIN
        if (editor.getRole() == Role.ROLE_ADMIN) {
            return newRole != Role.ROLE_SUPERADMIN && target.getRole() != Role.ROLE_SUPERADMIN;
        }
        
        // USER kan inte ändra roller
        return false;
    }
} 