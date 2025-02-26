package com.dftm.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
<<<<<<< HEAD
=======
import org.springframework.security.authentication.BadCredentialsException;
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dftm.config.JwtService;
import com.dftm.dto.AuthenticationRequest;
import com.dftm.dto.AuthenticationResponse;
import com.dftm.dto.RegisterRequest;
<<<<<<< HEAD
import com.dftm.exception.EmailAlreadyExistsException;
=======
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
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
        try {
            log.debug("\033[0;33m Checking if user exists in database \033[0m");
            var userExists = userRepository.findByEmail(request.getEmail());
            if (userExists.isEmpty()) {
                log.error("\033[0;31m User not found in database: {} \033[0m", request.getEmail());
                throw new UsernameNotFoundException("User not found");
            }
            
<<<<<<< HEAD
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
=======
            var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                
            log.info("User authenticated. Email: {}, Role: {}", user.getEmail(), user.getRole());
            
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
            var jwtToken = jwtService.generateToken(user);
            return AuthenticationResponse.builder()
<<<<<<< HEAD
                    .token(jwtToken)
                    .build();
        } catch (Exception e) {
            log.error("\033[0;31m Login failed for: {} with error: {} \033[0m", request.getEmail(), e.getMessage());
            throw e;
=======
                .token(jwtToken)
                .build();
        } catch (BadCredentialsException e) {
            log.error("Invalid credentials for user: {}", request.getEmail());
            throw new RuntimeException("Invalid credentials");
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
        }
    }
} 