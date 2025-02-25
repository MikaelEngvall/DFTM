package com.dftm.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dftm.config.JwtService;
import com.dftm.dto.AuthenticationRequest;
import com.dftm.dto.AuthenticationResponse;
import com.dftm.dto.RegisterRequest;
import com.dftm.exception.EmailAlreadyExistsException;
import com.dftm.model.Role;
import com.dftm.model.User;
import com.dftm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        log.debug("\033[0;33m Registering new user: {} \033[0m", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("\033[0;31m Email already exists: {} \033[0m", request.getEmail());
            throw new EmailAlreadyExistsException("Email already exists");
        }
        
        var hashedPassword = passwordEncoder.encode(request.getPassword());
        log.debug("\033[0;33m Generated password hash: {} \033[0m", hashedPassword);
        
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(hashedPassword)
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_USER)
                .preferredLanguage(request.getPreferredLanguage())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.save(user);
        log.debug("\033[0;32m User saved to database \033[0m");
        
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.error("\033[0;33m Attempting to login user: {} \033[0m", request.getEmail());
        try {
            log.debug("\033[0;33m Checking if user exists in database \033[0m");
            var userExists = userRepository.findByEmail(request.getEmail());
            if (userExists.isEmpty()) {
                log.error("\033[0;31m User not found in database: {} \033[0m", request.getEmail());
                throw new UsernameNotFoundException("User not found");
            }
            
            // Logga hashat lösenord från databasen
            log.debug("\033[0;33m Stored password hash: {} \033[0m", userExists.get().getPassword());
            
            log.debug("\033[0;32m User found in database. Attempting authentication... \033[0m");
            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                    )
                );
            } catch (Exception e) {
                log.error("\033[0;31m Authentication failed: {} \033[0m", e.getMessage());
                throw e;
            }
            
            var user = userExists.get();
            var jwtToken = jwtService.generateToken(user);
            log.error("\033[0;32m Login successful for: {} \033[0m", request.getEmail());
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .build();
        } catch (Exception e) {
            log.error("\033[0;31m Login failed for: {} with error: {} \033[0m", request.getEmail(), e.getMessage());
            throw e;
        }
    }
} 