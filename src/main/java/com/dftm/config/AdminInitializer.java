package com.dftm.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.dftm.model.Language;
import com.dftm.model.Role;
import com.dftm.model.User;
import com.dftm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Kommenterar bort skapande av standardanvändare
        /*
        createUserIfNotExists(
            "superadmin@dftm.com", 
            "Super", 
            "Admin", 
            "superadmin123", 
            Role.ROLE_SUPERADMIN
        );
        
        createUserIfNotExists(
            "admin@dftm.com", 
            "Admin", 
            "User", 
            "admin123", 
            Role.ROLE_ADMIN
        );
        
        createUserIfNotExists(
            "user@dftm.com", 
            "Regular", 
            "User", 
            "user123", 
            Role.ROLE_USER
        );
        */
        
        log.info("Automatisk skapande av användare har inaktiverats.");
    }
    
    private void createUserIfNotExists(String email, String firstName, String lastName, String password, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .preferredLanguage(Language.SV)
                    .active(true)
                    .createdAt(LocalDateTime.now().toString())
                    .updatedAt(LocalDateTime.now().toString())
                    .build();
            userRepository.save(user);
            log.info("User created with role {}: {}", role.getValue(), email);
        }
    }
} 