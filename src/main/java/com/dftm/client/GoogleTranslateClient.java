package com.dftm.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GoogleTranslateClient {
    
    @Value("${google.translate.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        String url = String.format(
            "https://translation.googleapis.com/language/translate/v2?key=%s&q=%s&source=%s&target=%s",
            apiKey, text, sourceLanguage, targetLanguage
        );
        
        // TODO: Implementera faktiskt Google Translate API-anrop
        return text; // Placeholder
    }
} 