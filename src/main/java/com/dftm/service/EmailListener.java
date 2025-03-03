package com.dftm.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dftm.config.JavaMailProperties;
import com.dftm.model.Language;
import com.dftm.model.PendingTask;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;
import com.dftm.model.Translation;
import com.dftm.repository.PendingTaskRepository;

import jakarta.mail.Address;
import jakarta.mail.BodyPart;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMultipart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailListener {
    
    private final JavaMailProperties mailProperties;
    private final PendingTaskRepository pendingTaskRepository;
    private final Environment environment;
    private final TranslationService translationService;
    
    private static final String TARGET_RECIPIENT = "felanmalan@duggalsfastigheter.se";
    private static final String TARGET_SENDER = "mikael.engvall.me@gmail.com";

    private boolean isDevEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("dev".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    @Scheduled(fixedDelay = 60000) // Kör varje minut
    public void checkEmails() {
        log.info("Checking emails...");
        
        // Skydda mot null-värden
        if (mailProperties == null || 
            mailProperties.getHost() == null || 
            mailProperties.getUsername() == null || 
            mailProperties.getPassword() == null) {
            log.error("Mail properties are not properly configured");
            return;
        }
        
        // I utvecklingsmiljö, skippa e-postanslutningen
        if (isDevEnvironment()) {
            log.info("Running in dev environment - skipping email check");
            return;
        }
        
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
                
                // Hämta alla olästa meddelanden
                Message[] messages = inbox.search(
                    new jakarta.mail.search.FlagTerm(
                        new jakarta.mail.Flags(jakarta.mail.Flags.Flag.SEEN), 
                        false
                    )
                );
                
                log.info("Found {} unread messages", messages.length);
                
                for (Message message : messages) {
                    // Kontrollera avsändare och mottagare
                    boolean isFromTargetSender = false;
                    boolean isToTargetRecipient = false;
                    
                    // Kolla avsändare
                    Address[] fromAddresses = message.getFrom();
                    if (fromAddresses != null && fromAddresses.length > 0) {
                        for (Address address : fromAddresses) {
                            if (address instanceof InternetAddress) {
                                String sender = ((InternetAddress) address).getAddress();
                                log.info("Message from: {}", sender);
                                if (TARGET_SENDER.equalsIgnoreCase(sender)) {
                                    isFromTargetSender = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Kolla mottagare
                    Address[] recipients = message.getRecipients(Message.RecipientType.TO);
                    if (recipients != null && recipients.length > 0) {
                        for (Address address : recipients) {
                            if (address instanceof InternetAddress) {
                                String recipient = ((InternetAddress) address).getAddress();
                                log.info("Message to: {}", recipient);
                                if (TARGET_RECIPIENT.equalsIgnoreCase(recipient)) {
                                    isToTargetRecipient = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Fortsätt bara om meddelandet är från rätt avsändare till rätt mottagare
                    if (isFromTargetSender && isToTargetRecipient) {
                        log.info("Processing message from {} to {}", TARGET_SENDER, TARGET_RECIPIENT);
                        processEmail(message);
                    } else {
                        log.info("Skipping message - not matching target sender and recipient");
                    }
                    
                    // Markera meddelandet som läst oavsett
                    message.setFlag(jakarta.mail.Flags.Flag.SEEN, true);
                }
                
                inbox.close(false);
            }
        } catch (Exception e) {
            log.error("Error checking emails: {}", e.getMessage(), e);
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
            // Skapa översättningar för titel och beskrivning
            Translation titleTranslation = translationService.createTranslation(title, Language.SV);
            Translation descriptionTranslation = translationService.createTranslation(finalDescription, Language.SV);
            
            // Översätt till alla tillgängliga språk
            Map<Language, String> titleTranslations = new HashMap<>();
            Map<Language, String> descriptionTranslations = new HashMap<>();
            
            for (Language language : Language.values()) {
                if (language != Language.SV) {
                    // Översätt från svenska till andra språk
                    String translatedTitle = "";
                    String translatedDescription = "";
                    
                    try {
                        translatedTitle = translationService.getTranslatedText(
                            titleTranslation.getId(), language);
                        translatedDescription = translationService.getTranslatedText(
                            descriptionTranslation.getId(), language);
                            
                        // Om översättningen inte finns i databasen, gör översättningen med Google Translate
                        if (translatedTitle.equals(title)) {
                            translatedTitle = translationService.translate(title, language.getCode());
                            // Spara översättningen
                            Map<Language, String> translations = titleTranslation.getTranslations();
                            translations.put(language, translatedTitle);
                            titleTranslation.setTranslations(translations);
                        }
                        
                        if (translatedDescription.equals(finalDescription)) {
                            translatedDescription = translationService.translate(finalDescription, language.getCode());
                            // Spara översättningen
                            Map<Language, String> translations = descriptionTranslation.getTranslations();
                            translations.put(language, translatedDescription);
                            descriptionTranslation.setTranslations(translations);
                        }
                    } catch (Exception e) {
                        log.error("Error translating to {}: {}", language, e.getMessage());
                        // Om översättningen misslyckas, använd originaltexten
                        translatedTitle = title;
                        translatedDescription = finalDescription;
                    }
                    
                    titleTranslations.put(language, translatedTitle);
                    descriptionTranslations.put(language, translatedDescription);
                }
            }
            
            // Spara uppdaterade översättningar i databasen
            translationService.updateTranslation(titleTranslation);
            translationService.updateTranslation(descriptionTranslation);
            
            PendingTask pendingTask = PendingTask.builder()
                    .title(title)
                    .description(finalDescription)
                    .reporter(reporterEmail)
                    .sender(TARGET_SENDER)
                    .recipient(TARGET_RECIPIENT)
                    .createdAt(now)
                    .updatedAt(now)
                    .titleTranslations(titleTranslations)
                    .descriptionTranslations(descriptionTranslations)
                    .originalLanguage(Language.SV)
                    .status(TaskStatus.PENDING.toString())
                    .priority(TaskPriority.MEDIUM.toString())
                    .assigned(false)
                    .approved(false)
                    .build();
            
            log.info("\033[0;34m Creating PendingTask: \n" + 
                    "Title: {}\n" +
                    "Description: {}\n" +
                    "Reporter: {}\n" +
                    "CreatedAt: {}\n" +
                    "With translations to: {}\n" +
                    "\033[0m",
                    pendingTask.getTitle(),
                    pendingTask.getDescription(),
                    pendingTask.getReporter(),
                    pendingTask.getCreatedAt(),
                    pendingTask.getTitleTranslations().keySet());
                    
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
        if (content == null) {
            return "";
        }
        
        // Ta bort HTML-taggar
        String noHtml = content.replaceAll("<[^>]*>", "");
        
        // Konvertera HTML-entiteter
        String decodedHtml = noHtml
            .replace("&nbsp;", " ")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")
            .replace("&quot;", "\"")
            .replace("&apos;", "'");
        
        return decodedHtml;
    }
} 