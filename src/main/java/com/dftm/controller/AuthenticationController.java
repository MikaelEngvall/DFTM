package com.dftm.controller;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.dto.AuthenticationRequest;
import com.dftm.dto.AuthenticationResponse;
import com.dftm.dto.RegisterRequest;
import com.dftm.service.AuthenticationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final MessageSource messageSource;

    private String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.debug("POST request to register new user");
        AuthenticationResponse response = authenticationService.register(request);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("user.created"))
            .body(response);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        log.debug("POST request to authenticate user");
        AuthenticationResponse response = authenticationService.authenticate(request);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("system.success"))
            .body(response);
    }
} 