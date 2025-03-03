package com.dftm.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dftm.client.GoogleTranslateClient;
import com.dftm.config.JavaMailProperties;
import com.dftm.model.Language;
import com.dftm.model.PendingTask;
import com.dftm.repository.PendingTaskRepository;

import jakarta.mail.Address;
import jakarta.mail.BodyPart;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
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
    private final GoogleTranslateClient googleTranslateClient;
    
    private static final String TARGET_RECIPIENT = "felanmalan@duggalsfastigheter.se";
    private static final String TARGET_SENDER = "felanmalan@duggalsfastigheter.se";
    private static final String TARGET_REPLY_TO = "mikael.engvall.me@gmail.com";

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
        
        // I utvecklingsmiljö, logga men fortsätt körningen
        boolean isDev = isDevEnvironment();
        if (isDev) {
            log.info("Running in dev environment - will look for emails with Reply-To: {}", TARGET_REPLY_TO);
            // Ingen return här - fortsätt köra även i utvecklingsmiljön
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
                    // Kontrollera avsändare, Reply-To och mottagare
                    boolean isFromTargetSender = false;
                    boolean hasTargetReplyTo = false;
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
                    
                    // Kolla Reply-To
                    Address[] replyToAddresses = message.getReplyTo();
                    if (replyToAddresses != null && replyToAddresses.length > 0) {
                        for (Address address : replyToAddresses) {
                            if (address instanceof InternetAddress) {
                                String replyTo = ((InternetAddress) address).getAddress();
                                log.info("Message reply-to: {}", replyTo);
                                if (TARGET_REPLY_TO.equalsIgnoreCase(replyTo)) {
                                    hasTargetReplyTo = true;
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
                    
                    // Fortsätt bara om meddelandet är från rätt avsändare till rätt mottagare och har rätt Reply-To
                    boolean shouldProcess = false;
                    
                    if (isDevEnvironment()) {
                        // I utvecklingsmiljö, kolla efter Reply-To
                        if (isFromTargetSender && hasTargetReplyTo) {
                            shouldProcess = true;
                            log.info("Processing message with Reply-To: {}", TARGET_REPLY_TO);
                        }
                    } else {
                        // I produktion, tillåt alla mail från rätt avsändare till rätt mottagare
                        if (isFromTargetSender && isToTargetRecipient) {
                            shouldProcess = true;
                            log.info("Processing message in production");
                        }
                    }
                    
                    if (shouldProcess) {
                        processEmail(message);
                    } else {
                        log.info("Skipping message - not matching criteria");
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
        log.info("\033[0;34m Raw content:\n{}\033[0m", content);

        // Parse email content
        Map<String, String> extractedFields = new HashMap<>();
        StringBuilder description = new StringBuilder();
        boolean isDescription = false;
        boolean pastSeparator = false;

        // Dela upp innehållet i rader
        String[] lines = content.split("\n");
        boolean foundMeddelande = false;
        
        for (String line : lines) {
            String trimmedLine = line.trim();
            
            // Hoppa över tomma rader
            if (trimmedLine.isEmpty()) {
                continue;
            }
            
            // Kolla efter separatorn
            if (trimmedLine.startsWith("---")) {
                pastSeparator = true;
                isDescription = false;
                continue;
            }
            
            // Hoppa över allt efter separatorn
            if (pastSeparator) {
                continue;
            }
            
            // Hantera olika fält
            if (trimmedLine.startsWith("Namn:")) {
                extractedFields.put("name", trimmedLine.substring("Namn:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("E-post:")) {
                extractedFields.put("email", trimmedLine.substring("E-post:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Telefonnummer:")) {
                extractedFields.put("phone", trimmedLine.substring("Telefonnummer:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Adress:")) {
                extractedFields.put("address", trimmedLine.substring("Adress:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Lägenhetsnummer:")) {
                extractedFields.put("apartment", trimmedLine.substring("Lägenhetsnummer:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Meddelande:")) {
                isDescription = true;
                foundMeddelande = true;
                String initialDescription = trimmedLine.substring("Meddelande:".length()).trim();
                if (!initialDescription.isEmpty()) {
                    description.append(initialDescription);
                }
            }
            else if (isDescription && foundMeddelande) {
                // Bevara radbrytningar genom att lägga till en ny rad
                if (description.length() > 0) {
                    description.append("\n");
                }
                description.append(trimmedLine);
            }
            else {
                // Om vi har en rad som inte passar in i något mönster,
                // kan vi behöva hantera sammanslagna fält
                for (String fieldPrefix : new String[]{"Namn:", "E-post:", "Telefonnummer:", "Adress:", "Lägenhetsnummer:", "Meddelande:"}) {
                    int index = trimmedLine.indexOf(fieldPrefix);
                    if (index > 0) {
                        // Vi hittade ett fältprefix i mitten av raden
                        String beforePrefix = trimmedLine.substring(0, index).trim();
                        String afterPrefix = trimmedLine.substring(index).trim();
                        
                        // Rekursiv behandling för att hantera multipla fält på samma rad
                        processPartialLine(beforePrefix, extractedFields, description, isDescription);
                        processPartialLine(afterPrefix, extractedFields, description, isDescription);
                        break;
                    }
                }
            }
        }

        // Rensa beskrivningen och ta bort eventuell text efter "---"
        String finalDescription = description.toString().trim();
        int separatorIndex = finalDescription.indexOf("---");
        if (separatorIndex > 0) {
            finalDescription = finalDescription.substring(0, separatorIndex).trim();
        }
        
        if (finalDescription.isEmpty()) {
            finalDescription = "Ingen beskrivning tillgänglig";
        }
        
        // Identifiera språket i beskrivningen
        String detectedLanguageCode = googleTranslateClient.detectLanguage(finalDescription);
        Language detectedLanguage = null;
        
        try {
            // Försök matcha den detekterade språkkoden mot enum Language
            for (Language language : Language.values()) {
                if (language.getCode().equals(detectedLanguageCode)) {
                    detectedLanguage = language;
                    break;
                }
            }
            
            // Om inget språk matchades, använd svenska som standard
            if (detectedLanguage == null) {
                detectedLanguage = Language.SV;
                log.warn("Kunde inte matcha detekterat språk '{}', använder svenska som standard", detectedLanguageCode);
            }
        } catch (Exception e) {
            detectedLanguage = Language.SV;
            log.error("Fel vid språkdetektion, använder svenska som standard: {}", e.getMessage(), e);
        }
        
        // Översätt beskrivningen till alla andra språk
        Map<Language, String> translations = new HashMap<>();
        for (Language targetLanguage : Language.values()) {
            // Hoppa över originalspråket
            if (targetLanguage == detectedLanguage) {
                continue;
            }
            
            try {
                String translatedText = googleTranslateClient.translate(
                    finalDescription, 
                    detectedLanguage.getCode(), 
                    targetLanguage.getCode()
                );
                translations.put(targetLanguage, translatedText);
                log.info("Översatte beskrivning från {} till {}", detectedLanguage.getCode(), targetLanguage.getCode());
            } catch (Exception e) {
                log.error("Fel vid översättning till {}: {}", targetLanguage.getCode(), e.getMessage(), e);
            }
        }
        
        // Logga de extraherade fälten
        log.info("\033[0;32m Extracted fields: \033[0m");
        extractedFields.forEach((key, value) -> log.info("\033[0;32m {} = {} \033[0m", key, value));
        log.info("\033[0;32m description = {} \033[0m", finalDescription);
        
        String name = extractedFields.getOrDefault("name", "");
        String email = extractedFields.getOrDefault("email", "");
        String phone = extractedFields.getOrDefault("phone", "");
        String address = extractedFields.getOrDefault("address", "");
        String apartment = extractedFields.getOrDefault("apartment", "");

        LocalDateTime now = LocalDateTime.now();
        
        try {
            // Skapa ett nytt ärende
            PendingTask pendingTask = PendingTask.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .address(address)
                .apartment(apartment)
                .description(finalDescription)
                .descriptionLanguage(detectedLanguage)
                .descriptionTranslations(translations)
                .status("NEW")
                .received(now)
                .build();
            
            log.info("\033[0;34m Creating PendingTask: \n" + 
                    "Name: {}\n" +
                    "Email: {}\n" +
                    "Phone: {}\n" +
                    "Address: {}\n" +
                    "Apartment: {}\n" +
                    "Description: {}\n" +
                    "Received: {}\n" +
                    "\033[0m",
                    pendingTask.getName(),
                    pendingTask.getEmail(),
                    pendingTask.getPhone(),
                    pendingTask.getAddress(),
                    pendingTask.getApartment(),
                    pendingTask.getDescription(),
                    pendingTask.getReceived());
                    
            PendingTask savedTask = pendingTaskRepository.save(pendingTask);
            
            log.info("\033[0;32m Successfully created pending task with ID: {} \033[0m", 
                savedTask.getId());
        } catch (Exception e) {
            log.error("\033[0;31m Failed to save pending task: {} \033[0m", e.getMessage(), e);
            throw e;
        }
    }

    private void processPartialLine(String line, Map<String, String> extractedFields, StringBuilder description, boolean isDescription) {
        if (line.isEmpty()) {
            return;
        }
        
        String trimmedLine = line.trim();
        
        if (trimmedLine.startsWith("Namn:")) {
            extractedFields.put("name", trimmedLine.substring("Namn:".length()).trim());
        } 
        else if (trimmedLine.startsWith("E-post:")) {
            extractedFields.put("email", trimmedLine.substring("E-post:".length()).trim());
        } 
        else if (trimmedLine.startsWith("Telefonnummer:")) {
            extractedFields.put("phone", trimmedLine.substring("Telefonnummer:".length()).trim());
        } 
        else if (trimmedLine.startsWith("Adress:")) {
            extractedFields.put("address", trimmedLine.substring("Adress:".length()).trim());
        } 
        else if (trimmedLine.startsWith("Lägenhetsnummer:")) {
            extractedFields.put("apartment", trimmedLine.substring("Lägenhetsnummer:".length()).trim());
        } 
        else if (trimmedLine.startsWith("Meddelande:")) {
            String initialDescription = trimmedLine.substring("Meddelande:".length()).trim();
            if (!initialDescription.isEmpty()) {
                description.append(initialDescription);
            }
        }
        else if (isDescription) {
            // Bevara radbrytningar även i processPartialLine
            if (description.length() > 0) {
                description.append("\n");
            }
            description.append(trimmedLine);
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
                // Extrahera text från HTML
                String htmlContent = bodyPart.getContent().toString();
                result.append(htmlContent);
            }
            else if (bodyPart.getContent() instanceof MimeMultipart) {
                result.append(getTextFromMimeMultipart((MimeMultipart)bodyPart.getContent()));
            }
        }
        
        String text = result.toString();
        log.info("\033[0;34m Extracted text content (first 200 chars): \n{} \033[0m", 
            text.length() > 200 ? text.substring(0, 200) + "..." : text);
        return text;
    }

    private String cleanHtmlContent(String content) {
        if (content == null) {
            return "";
        }
        
        // Ta bort alla <style> och <script>-taggar med innehåll
        String noStyleScript = content.replaceAll("<style[^>]*>.*?</style>", "")
                                     .replaceAll("<script[^>]*>.*?</script>", "");
        
        // Ta bort HTML-kommentarer
        String noComments = noStyleScript.replaceAll("<!--.*?-->", "");
        
        // Ta bort HTML-taggar men bevara radbrytningar
        String noHtml = noComments.replaceAll("<br\\s*/?>|<p>|</p>|<div>|</div>|<h\\d>|</h\\d>", "\n")
                                  .replaceAll("<[^>]*>", "");
        
        // Konvertera HTML-entiteter
        String decodedHtml = noHtml
            .replace("&nbsp;", " ")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")
            .replace("&quot;", "\"")
            .replace("&apos;", "'")
            .replace("&auml;", "ä")
            .replace("&ouml;", "ö")
            .replace("&aring;", "å")
            .replace("&Auml;", "Ä")
            .replace("&Ouml;", "Ö")
            .replace("&Aring;", "Å");
        
        // Normalisera fältstruktur för bättre parsning
        decodedHtml = decodedHtml
            .replace("Namn:", "\nNamn:")
            .replace("E-post:", "\nE-post:")
            .replace("Telefonnummer:", "\nTelefonnummer:")
            .replace("Adress:", "\nAdress:")
            .replace("Lägenhetsnummer:", "\nLägenhetsnummer:")
            .replace("Meddelande:", "\nMeddelande:")
            .replace("---", "\n---\n");
        
        // Ta bort upprepade radbrytningar och onödiga blanksteg
        decodedHtml = decodedHtml.replaceAll("\\n\\s*\\n", "\n")
                                 .replaceAll("[ \\t]+", " ") // Ersätt endast mellanslag och tabbar, bevara radbrytningar
                                 .trim();
        
        // Lägg till radbrytningar på nytt
        decodedHtml = decodedHtml
                                 .replace("Namn:", "\nNamn:")
                                 .replace("E-post:", "\nE-post:")
                                 .replace("Telefonnummer:", "\nTelefonnummer:")
                                 .replace("Adress:", "\nAdress:")
                                 .replace("Lägenhetsnummer:", "\nLägenhetsnummer:")
                                 .replace("Meddelande:", "\nMeddelande:");
        
        return decodedHtml;
    }
} 