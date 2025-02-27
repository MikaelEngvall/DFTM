package com.dftm.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
        log.debug("Registering new user: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("Email already exists: {}", request.getEmail());
            throw new EmailAlreadyExistsException("Email already exists");
        }
        
        var hashedPassword = passwordEncoder.encode(request.getPassword());
        
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
        log.debug("User saved to database");
        
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        var user = userRepository.findByEmail(request.getEmail())
            .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        log.info("User attempting authentication. Email: {}, Role: {}", user.getEmail(), user.getRole());
        return AuthenticationResponse.builder()
            .token(jwtToken)
            .build();
    }
} 