package com.dftm.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class GoogleTranslateClient {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${google.translate.api.key}")
    private String apiKey;
    
    private static final String TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";
    private static final String DETECT_URL = "https://translation.googleapis.com/language/translate/v2/detect";
    
    public GoogleTranslateClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        try {
            if (text == null || text.trim().isEmpty()) {
                return text;
            }
            
            // Bygg URL med parametrar
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(TRANSLATE_URL)
                .queryParam("key", apiKey)
                .queryParam("q", text)
                .queryParam("target", targetLanguage);
            
            if (sourceLanguage != null && !sourceLanguage.isEmpty()) {
                builder.queryParam("source", sourceLanguage);
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                builder.build().toUri(),
                HttpMethod.GET,
                entity,
                String.class
            );
            
            // Parsa JSON-svaret
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode translations = root.path("data").path("translations");
            
            if (translations.isArray() && translations.size() > 0) {
                String translatedText = translations.get(0).path("translatedText").asText();
                return decodeHtmlEntities(translatedText);
            }
            
            log.warn("Kunde inte översätta text: Inga översättningar i svaret");
            return text;
        } catch (Exception e) {
            log.error("Fel vid översättning: {}", e.getMessage(), e);
            return text; // Returnera originaltext vid fel
        }
    }
    
    /**
     * Översätter text till önskat målspråk. Denna metod antar att källspråket är svenska.
     *
     * @param text Text att översätta
     * @param targetLanguage Målspråkskod
     * @return Översatt text
     */
    public String translate(String text, String targetLanguage) {
        return translate(text, "sv", targetLanguage);
    }
    
    /**
     * Detekterar språket för en given text. 
     * 
     * @param text Text för språkidentifiering
     * @return Språkkod (t.ex. "sv", "en")
     */
    public String detectLanguage(String text) {
        try {
            if (text == null || text.trim().isEmpty()) {
                return "sv"; // Standard för tom text
            }
            
            // Bygg URL med parametrar
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(DETECT_URL)
                .queryParam("key", apiKey)
                .queryParam("q", text);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                builder.build().toUri(),
                HttpMethod.GET,
                entity,
                String.class
            );
            
            // Parsa JSON-svaret
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode detections = root.path("data").path("detections");
            
            if (detections.isArray() && detections.size() > 0 && 
                detections.get(0).isArray() && detections.get(0).size() > 0) {
                String detectedLanguage = detections.get(0).get(0).path("language").asText();
                log.debug("Detekterat språk: {}", detectedLanguage);
                return detectedLanguage;
            }
            
            log.warn("Kunde inte detektera språk: Inga detektioner i svaret");
            return "sv"; // Standardspråk om detektion misslyckas
        } catch (Exception e) {
            log.error("Fel vid språkdetektering: {}", e.getMessage(), e);
            return "sv"; // Standardspråk vid fel
        }
    }
    
    /**
     * Avkodar HTML-entiteter i översatt text
     * 
     * @param text Text med möjliga HTML-entiteter
     * @return Avkodad text
     */
    private String decodeHtmlEntities(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        
        return text.replace("&amp;", "&")
                  .replace("&lt;", "<")
                  .replace("&gt;", ">")
                  .replace("&quot;", "\"")
                  .replace("&#39;", "'")
                  .replace("&apos;", "'")
                  .replace("&nbsp;", " ")
                  .replace("&auml;", "ä")
                  .replace("&ouml;", "ö")
                  .replace("&aring;", "å")
                  .replace("&Auml;", "Ä")
                  .replace("&Ouml;", "Ö")
                  .replace("&Aring;", "Å");
    }
} 