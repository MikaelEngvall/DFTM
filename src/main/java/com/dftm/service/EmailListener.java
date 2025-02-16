package com.dftm.service;

import java.util.Properties;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dftm.model.Task;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;
import com.dftm.config.JavaMailProperties;
import com.dftm.model.PendingTask;
import com.dftm.repository.PendingTaskRepository;

import jakarta.annotation.PostConstruct;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.Flags;
import jakarta.mail.BodyPart;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.internet.InternetAddress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.mail.Multipart;
import jakarta.activation.DataHandler;
import jakarta.mail.util.ByteArrayDataSource;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailListener {
    
    private final TaskService taskService;
    private final JavaMailProperties mailProperties;
    private final PendingTaskRepository pendingTaskRepository;
    private static final String MAIL_STORE_TYPE = "imaps";

    @Scheduled(fixedDelay = 60000) // Kör varje minut
    public void checkEmail() {
        log.info("\033[0;33m Checking emails... \033[0m");
        Properties properties = new Properties();
        properties.put("mail.store.protocol", MAIL_STORE_TYPE);
        properties.put("mail.imaps.host", mailProperties.getHost());
        properties.put("mail.imaps.port", mailProperties.getPort());

        try {
            Session session = Session.getDefaultInstance(properties);
            Store store = session.getStore(MAIL_STORE_TYPE);
            store.connect(
                mailProperties.getHost(),
                mailProperties.getUsername(),
                mailProperties.getPassword()
            );

            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_WRITE);

            Message[] messages = inbox.getMessages();
            for (Message message : messages) {
                if (!message.isSet(Flags.Flag.SEEN)) {
                    processEmail(message);
                    message.setFlag(Flags.Flag.SEEN, true);
                }
            }

            inbox.close(false);
            store.close();
            log.info("\033[0;32m Email check completed \033[0m");
        } catch (Exception e) {
            log.error("\033[0;31m Error checking emails: {} \033[0m", e.getMessage());
        }
    }

    private void processEmail(Message message) throws Exception {
        String content = getTextFromMessage(message);
        log.info("\033[0;34m ===== RAW EMAIL CONTENT START =====\n{}\n===== RAW EMAIL CONTENT END =====\033[0m", content);
        
        // Debug varje regex-matchning
        log.info("\033[0;34m Trying to match patterns:");
        debugMatch(content, "Adress:\\s*([^\\n]+)", "Address");
        debugMatch(content, "Lägenhetsnummer:\\s*([^\\n]+)", "Apartment");
        debugMatch(content, "Telefonnummer:\\s*([^\\n]+)", "Phone");
        debugMatch(content, "Meddelande:\\s*([^\\n]+)", "Message");
        debugMatch(content, "E-post:\\s*([^\\n]+)", "Email");
        log.info("===== PATTERN MATCHING END =====\033[0m");
        
        // Extrahera information med regex
        String address = extractValue(content, "Adress:\\s*([^\\n]+)");
        String apartmentNumber = extractValue(content, "Lägenhetsnummer:\\s*([^\\n]+)");
        String phoneNumber = extractValue(content, "Telefonnummer:\\s*([^\\n]+)");
        String description = extractValue(content, "Meddelande:\\s*([^\\n]+)");
        String reporter = extractValue(content, "E-post:\\s*([^\\n]+)");
        
        log.info("Extracted values:\nAddress: '{}'\nApt: '{}'\nPhone: '{}'\nDesc: '{}'\nReporter: '{}'", 
            address, apartmentNumber, phoneNumber, description, reporter);
        
        // Skapa titel
        String title = String.format("Felanmälan från %s %s %s", 
            address.trim(), 
            apartmentNumber.trim(), 
            phoneNumber.trim()
        );
        
        log.info("Generated title: '{}'", title);
        
        LocalDateTime now = LocalDateTime.now();
        
        try {
            PendingTask pendingTask = PendingTask.builder()
                    .title(title)
                    .description(description.trim())
                    .reporter(reporter.trim())
                    .createdAt(now)
                    .updatedAt(now)
                    .assigned(false)
                    .build();
            
            log.info("\033[0;34m Creating PendingTask: \n" + 
                    "Title: {}\n" +
                    "Description: {}\n" +
                    "Reporter: {}\n" +
                    "CreatedAt: {}\n" +
                    "\033[0m",
                    pendingTask.getTitle(),
                    pendingTask.getDescription(),
                    pendingTask.getReporter(),
                    pendingTask.getCreatedAt());
                    
            PendingTask savedTask = pendingTaskRepository.save(pendingTask);
            log.info("\033[0;32m Successfully created pending task with ID: {} \033[0m", savedTask.getId());
        } catch (Exception e) {
            log.error("\033[0;31m Failed to save pending task: {} \033[0m", e.getMessage(), e);
            throw e;
        }
    }

    private String extractValue(String content, String pattern) {
        Pattern p = Pattern.compile(pattern, Pattern.MULTILINE);
        Matcher m = p.matcher(content);
        String result = m.find() ? m.group(1).trim() : "";
        log.debug("Pattern: '{}' -> Result: '{}'", pattern, result);
        return result;
    }

    private String getTextFromMessage(Message message) throws Exception {
        if (message.isMimeType("text/plain")) {
            Object content = message.getContent();
            log.info("\033[0;34m Content type: {} \033[0m", content.getClass().getName());
            return new String(content.toString().getBytes("ISO-8859-1"), "UTF-8");
        }
        if (message.isMimeType("multipart/*")) {
            MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
            return getTextFromMimeMultipart(mimeMultipart);
        }
        return "";
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws Exception {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < mimeMultipart.getCount(); i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            if (bodyPart.isMimeType("text/plain")) {
                Object content = bodyPart.getContent();
                String text = new String(content.toString().getBytes("ISO-8859-1"), "UTF-8");
                result.append(text);
                log.info("\033[0;34m Part {}: '{}' \033[0m", i, text);
            }
        }
        return result.toString();
    }

    private void debugMatch(String content, String pattern, String field) {
        Pattern p = Pattern.compile(pattern, Pattern.MULTILINE);
        Matcher m = p.matcher(content);
        if (m.find()) {
            log.info("Found match for {}: '{}'", field, m.group(1).trim());
        } else {
            log.info("No match found for {} with pattern: {}", field, pattern);
        }
    }
} 