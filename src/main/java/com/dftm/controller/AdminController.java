package com.dftm.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.model.Role;
import com.dftm.model.User;
import com.dftm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/reset-superadmin/{email}/{adminKey}")
    public ResponseEntity<String> resetSuperadmin(
            @PathVariable String email,
            @PathVariable String adminKey) {
            
        // Säkerhetskontroll - använd en hemlig nyckel för att begränsa åtkomst
        // OBS! Detta är bara en tillfällig lösning för att återställa admin-behörighet
        // Ta bort denna controller när problemet är löst!
        if (!"df131415".equals(adminKey)) {
            log.warn("Obehörig åtkomst försökte återställa superadmin: {}", email);
            return ResponseEntity.status(403).body("Obehörig åtkomst");
        }
        
        // Hitta användaren
        User user = userRepository.findByEmail(email)
                .orElse(null);
                
        if (user == null) {
            log.warn("Försökte återställa icke-existerande användare: {}", email);
            return ResponseEntity.status(404).body("Användare hittades inte");
        }
        
        // Återställ användarens lösenord och sätt till superadmin
        user.setRole(Role.ROLE_SUPERADMIN);
        user.setActive(true);
        user.setPassword(passwordEncoder.encode("superadmin123"));
        
        userRepository.save(user);
        
        log.info("Återställde superadmin-behörighet för: {}", email);
        return ResponseEntity.ok("Superadmin-behörighet och lösenord återställt");
    }
    
    @PostMapping("/reset-all-users/{adminKey}")
    public ResponseEntity<String> resetAllUsers(@PathVariable String adminKey) {
        // Säkerhetskontroll
        if (!"df131415".equals(adminKey)) {
            log.warn("Obehörig åtkomst försökte återställa alla användare");
            return ResponseEntity.status(403).body("Obehörig åtkomst");
        }
        
        // Återställ standardanvändare (om de finns)
        resetUser("superadmin@dftm.com", "superadmin123", Role.ROLE_SUPERADMIN);
        resetUser("admin@dftm.com", "admin123", Role.ROLE_ADMIN);
        resetUser("user@dftm.com", "user123", Role.ROLE_USER);
        
        log.info("Återställde standardanvändare");
        return ResponseEntity.ok("Standardanvändare återställda");
    }
    
    private void resetUser(String email, String password, Role role) {
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user != null) {
            user.setRole(role);
            user.setActive(true);
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
            log.info("Återställde användare: {}", email);
        } else {
            log.warn("Kunde inte hitta användare att återställa: {}", email);
        }
    }
    
    @PostMapping("/test-create-user/{adminKey}")
    public ResponseEntity<String> testCreateUser(@PathVariable String adminKey) {
        // Säkerhetskontroll
        if (!"df131415".equals(adminKey)) {
            log.warn("Obehörig åtkomst försökte skapa testanvändare");
            return ResponseEntity.status(403).body("Obehörig åtkomst");
        }
        
        try {
            // Skapa en testanvändare med ROLE_USER
            User testUser = new User();
            testUser.setEmail("test" + System.currentTimeMillis() + "@example.com");
            testUser.setFirstName("Test");
            testUser.setLastName("Användare");
            testUser.setPassword(passwordEncoder.encode("test123"));
            testUser.setRole(Role.ROLE_USER);
            testUser.setActive(true);
            
            userRepository.save(testUser);
            
            log.info("Skapade testanvändare: {}", testUser.getEmail());
            return ResponseEntity.ok("Testanvändare skapad: " + testUser.getEmail());
        } catch (Exception e) {
            log.error("Fel vid skapande av testanvändare", e);
            return ResponseEntity.status(500).body("Fel: " + e.getMessage());
        }
    }
} 