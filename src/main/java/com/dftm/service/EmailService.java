package com.dftm.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender emailSender;

    public void sendTaskNotification(String to, String subject, String content) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            emailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email", e);
            throw new RuntimeException("Could not send email", e);
        }
    }
    
    /**
     * Skickar en e-postnotifikation om en ny kommentar
     * 
     * @param to E-postadressen till mottagaren
     * @param taskTitle Uppgiftens titel
     * @param commentText Kommentarens text
     */
    public void sendCommentNotification(String to, String taskTitle, String commentText) {
        String subject = "Ny kommentar på uppgift: " + taskTitle;
        String content = "<h2>Ny kommentar har lagts till på din uppgift</h2>" 
                + "<p><strong>Uppgift:</strong> " + taskTitle + "</p>"
                + "<p><strong>Kommentar:</strong> " + commentText + "</p>"
                + "<p>Logga in i systemet för att se mer information.</p>";
        
        sendTaskNotification(to, subject, content);
    }
} 