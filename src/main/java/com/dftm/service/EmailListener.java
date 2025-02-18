package com.dftm.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Properties;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dftm.config.JavaMailProperties;
import com.dftm.model.Language;
import com.dftm.model.PendingTask;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;
import com.dftm.repository.PendingTaskRepository;

import jakarta.mail.BodyPart;
import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.internet.MimeMultipart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailListener {
    
    private final JavaMailProperties mailProperties;
    private final PendingTaskRepository pendingTaskRepository;

    @Scheduled(fixedDelay = 60000) // Kör varje minut
    public void checkEmail() {
        log.info("\033[0;33m Checking emails... \033[0m");
        Properties properties = new Properties();
        properties.put("mail.store.protocol", "imaps");
        properties.put("mail.imaps.host", mailProperties.getHost());
        properties.put("mail.imaps.port", mailProperties.getPort());

        try {
            Session session = Session.getDefaultInstance(properties);
            try (Store store = session.getStore("imaps")) {
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
            }
            log.info("\033[0;32m Email check completed \033[0m");
        } catch (Exception e) {
            log.error("\033[0;31m Error checking emails: {} \033[0m", e.getMessage());
        }
    }

    private void processEmail(Message message) throws Exception {
        String content = getTextFromMessage(message);
        
        // Rensa HTML först
        content = cleanHtmlContent(content);
        
        log.info("\033[0;34m Cleaned content:\n{}\033[0m", content);
        
        // Kontrollera om innehållet är tomt
        if (content == null || content.trim().isEmpty()) {
            log.warn("\033[0;33m Skipping empty email message \033[0m");
            return;
        }
        
        log.info("\033[0;34m Raw content length: {} \033[0m", content.length());
        log.info("\033[0;34m Raw content bytes: {} \033[0m", 
            String.format("%040x", new java.math.BigInteger(1, content.getBytes(java.nio.charset.StandardCharsets.UTF_8))));
        log.info("\033[0;34m Raw content:\n{}\033[0m", content);

        // Parse email content
        String[] lines = content.split("\n");
        String reporterName = "";
        String reporterEmail = "";
        String reporterPhone = "";
        String address = "";
        String apartmentNumber = "";
        StringBuilder description = new StringBuilder();
        boolean isDescription = false;

        for (String line : lines) {
            String trimmedLine = line.trim();
            
            if (trimmedLine.startsWith("Meddelande:")) {
                isDescription = true;
                // Ta med själva meddelandet om det finns på samma rad
                String messageContent = trimmedLine.replace("Meddelande:", "").trim();
                if (!messageContent.isEmpty()) {
                    description.append(messageContent).append("\n");
                }
            } 
            else if (trimmedLine.equals("---")) {
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Namn:")) {
                reporterName = trimmedLine.replace("Namn:", "").trim();
                log.info("\033[0;34m Found reporter name: {} \033[0m", reporterName);
            } 
            else if (trimmedLine.startsWith("E-post:")) {
                reporterEmail = trimmedLine.replace("E-post:", "").trim();
                log.info("\033[0;34m Found reporter email: {} \033[0m", reporterEmail);
            } 
            else if (trimmedLine.startsWith("Telefonnummer:")) {
                reporterPhone = trimmedLine.replace("Telefonnummer:", "").trim();
                log.info("\033[0;34m Found reporter phone: {} \033[0m", reporterPhone);
            } 
            else if (trimmedLine.startsWith("Adress:")) {
                address = trimmedLine.replace("Adress:", "").trim();
                log.info("\033[0;34m Found address: {} \033[0m", address);
            } 
            else if (trimmedLine.startsWith("Lägenhetsnummer:")) {
                apartmentNumber = trimmedLine.replace("Lägenhetsnummer:", "").trim();
                log.info("\033[0;34m Found apartment number: {} \033[0m", apartmentNumber);
            } 
            else if (isDescription) {
                description.append(trimmedLine).append("\n");
            }
        }

        // Rensa beskrivningen
        String finalDescription = description.toString().trim();
        if (finalDescription.isEmpty()) {
            finalDescription = "Ingen beskrivning tillgänglig";
        }
        log.info("\033[0;34m Final description: {} \033[0m", finalDescription);

        String title = String.format("Felanmälan från %s %s %s", 
            address, apartmentNumber, reporterPhone);
        
        LocalDateTime now = LocalDateTime.now();
        
        try {
            PendingTask pendingTask = PendingTask.builder()
                    .title(title)
                    .description(finalDescription)
                    .reporter(reporterEmail)
                    .createdAt(now)
                    .updatedAt(now)
                    .titleTranslations(new HashMap<>())
                    .descriptionTranslations(new HashMap<>())
                    .originalLanguage(Language.SV)
                    .status(TaskStatus.PENDING.toString())
                    .priority(TaskPriority.MEDIUM.toString())
                    .active(true)
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
            
            log.info("\033[0;32m Successfully created pending task with ID: {} \033[0m", 
                savedTask.getId());
        } catch (Exception e) {
            log.error("\033[0;31m Failed to save pending task: {} \033[0m", e.getMessage(), e);
            throw e;
        }
    }

    private String getTextFromMessage(Message message) throws Exception {
        log.info("\033[0;34m Message type: {} \033[0m", message.getContentType());
        
        if (message.isMimeType("text/plain")) {
            Object content = message.getContent();
            log.info("\033[0;34m Plain text content: {} \033[0m", content);
            return content.toString();
        }
        
        if (message.isMimeType("multipart/*")) {
            MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
            log.info("\033[0;34m Found multipart message with {} parts \033[0m", mimeMultipart.getCount());
            return getTextFromMimeMultipart(mimeMultipart);
        }
        
        log.warn("\033[0;33m Unsupported message type: {} \033[0m", message.getContentType());
        return message.getContent().toString();
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws Exception {
        StringBuilder result = new StringBuilder();
        int count = mimeMultipart.getCount();
        
        for (int i = 0; i < count; i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            log.info("\033[0;34m Processing part {} of type {} \033[0m", i, bodyPart.getContentType());
            
            if (bodyPart.isMimeType("text/plain")) {
                result.append(bodyPart.getContent());
            }
            else if (bodyPart.isMimeType("text/html")) {
                log.info("\033[0;34m Found HTML content in part {} \033[0m", i);
                // Om vi behöver hantera HTML-innehåll senare
            }
            else if (bodyPart.getContent() instanceof MimeMultipart) {
                result.append(getTextFromMimeMultipart((MimeMultipart)bodyPart.getContent()));
            }
        }
        
        String text = result.toString();
        log.info("\033[0;34m Extracted text content: \n{} \033[0m", text);
        return text;
    }

    private String cleanHtmlContent(String content) {
        // Ersätt <br> med radbrytningar
        String cleaned = content.replace("<br>", "\n");
        
        // Ta bort eventuella andra HTML-taggar
        cleaned = cleaned.replaceAll("<[^>]+>", "");
        
        // Hantera specialtecken
        cleaned = cleaned.replace("&nbsp;", " ")
                        .replace("&lt;", "<")
                        .replace("&gt;", ">")
                        .replace("&amp;", "&");
        
        // Ta bort tomma rader och trimma
        return cleaned.lines()
                     .map(String::trim)
                     .filter(line -> !line.isEmpty())
                     .collect(java.util.stream.Collectors.joining("\n"));
    }
} 