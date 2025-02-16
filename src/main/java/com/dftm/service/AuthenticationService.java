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
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .preferredLanguage(request.getPreferredLanguage())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("\033[0;34m Attempting authentication for user: {} \033[0m", request.getEmail());
        
        try {
            // Kolla först om användaren finns
            var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getEmail()));

            // Försök autentisera
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );
            
            // Om autentiseringen lyckas, generera token
            var jwtToken = jwtService.generateToken(user);
            log.info("\033[0;32m Successfully authenticated user: {} \033[0m", request.getEmail());
            
            return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
                
        } catch (UsernameNotFoundException e) {
            log.error("\033[0;31m User not found: {} \033[0m", request.getEmail());
            throw new RuntimeException("Invalid credentials");
        } catch (BadCredentialsException e) {
            log.error("\033[0;31m Invalid password for user: {} \033[0m", request.getEmail());
            throw new RuntimeException("Invalid credentials");
        } catch (Exception e) {
            log.error("\033[0;31m Authentication failed for user: {}, error: {} \033[0m", 
                request.getEmail(), e.getMessage());
            throw new RuntimeException("Authentication failed");
        }
    }
} 