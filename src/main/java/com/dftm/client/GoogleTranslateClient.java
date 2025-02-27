package com.dftm.client;

import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class GoogleTranslateClient {
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        // TODO: Implementera faktisk Google Translate integration
        log.debug("Translating text from {} to {}: {}", sourceLanguage, targetLanguage, text);
        return text;
    }
} 