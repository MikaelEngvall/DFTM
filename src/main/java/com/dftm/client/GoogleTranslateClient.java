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
} 