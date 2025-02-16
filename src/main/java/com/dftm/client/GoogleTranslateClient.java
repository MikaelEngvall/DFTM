package com.dftm.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleTranslateClient {
    
    @Value("${google.translate.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    
    private static final String TRANSLATE_URL = 
        "https://translation.googleapis.com/language/translate/v2?key={key}";

    public String translate(String text, String sourceLang, String targetLang) {
        try {
            TranslateRequest request = new TranslateRequest(text, sourceLang, targetLang);
            TranslateResponse response = restTemplate.postForObject(
                TRANSLATE_URL,
                request,
                TranslateResponse.class,
                apiKey
            );
            
            if (response != null && response.getData() != null && 
                !response.getData().getTranslations().isEmpty()) {
                return response.getData().getTranslations().get(0).getTranslatedText();
            }
            
            throw new RuntimeException("No translation received");
        } catch (Exception e) {
            log.error("Translation failed: {}", e.getMessage());
            throw new RuntimeException("Translation failed", e);
        }
    }

    private record TranslateRequest(
        String q,
        String source,
        String target
    ) {}

    private record TranslateResponse(
        TranslateData data
    ) {
        public TranslateData getData() {
            return data;
        }
    }

    private record TranslateData(
        java.util.List<Translation> translations
    ) {
        public java.util.List<Translation> getTranslations() {
            return translations;
        }
    }

    private record Translation(
        String translatedText
    ) {
        public String getTranslatedText() {
            return translatedText;
        }
    }
} 