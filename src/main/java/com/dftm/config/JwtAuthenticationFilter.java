package com.dftm.config;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();
        final String requestMethod = request.getMethod();
        
        log.info("Request Path: {}", requestPath);
        log.info("Request Method: {}", requestMethod);
        log.info("Auth header: {}", authHeader != null ? authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : null);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("No Bearer token found in request");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(jwt);
        
        log.info("JWT token extracted for user: {}", userEmail);
        
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            
            log.info("User loaded: {}, Authorities: {}", userDetails.getUsername(), userDetails.getAuthorities());
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                log.info("Authentication set in SecurityContext: {}", authToken);
            } else {
                log.warn("Token validation failed for user: {}", userEmail);
            }
        } else {
            if (userEmail == null) {
                log.warn("Could not extract username from token");
            }
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                log.info("Authentication already exists in SecurityContext");
            }
        }
        
        filterChain.doFilter(request, response);
    }
} 