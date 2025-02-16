package com.dftm.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.dftm.model.Role;
import com.dftm.model.User;
import com.dftm.repository.UserRepository;
import com.dftm.model.Language;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@dftm.com")) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@dftm.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .preferredLanguage(Language.SV)
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            userRepository.save(admin);
            log.info("Admin user created successfully");
        }
    }
} 