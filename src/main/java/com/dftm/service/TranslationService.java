package com.dftm.service;

import org.springframework.stereotype.Service;

import com.dftm.client.GoogleTranslateClient;
import com.dftm.model.Language;
import com.dftm.model.Translation;
import com.dftm.repository.TranslationRepository;
import com.dftm.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranslationService {
    
    private final TranslationRepository translationRepository;
    private final GoogleTranslateClient googleTranslateClient;

    public String translate(String text, String targetLanguage) {
        // Implementation för Google Translate API
        return text; // Placeholder tills vi implementerar Google Translate
    }

    public void translateTask(String taskId, String targetLanguage) {
        // Implementation för att översätta hela task
    }

    public Translation translateAndSave(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        Map<Language, String> translations = new HashMap<>();
        
        // Översätt till alla språk förutom originalspråket (engelska)
        for (Language lang : Language.values()) {
            if (lang != Language.EN) {
                try {
                    String translated = googleTranslateClient.translate(text, "en", lang.getCode());
                    translations.put(lang, translated);
                } catch (Exception e) {
                    log.error("Failed to translate to {}: {}", lang, e.getMessage());
                }
            }
        }

        Translation translation = Translation.builder()
                .originalText(text)
                .translations(translations)
                .build();

        return translationRepository.save(translation);
    }

    public String getTranslation(String translationId, Language language) {
        Translation translation = translationRepository.findById(translationId)
                .orElseThrow(() -> new ResourceNotFoundException("Translation not found"));

        if (language == Language.EN) {
            return translation.getOriginalText();
        }

        return translation.getTranslations().getOrDefault(language, translation.getOriginalText());
    }

    public Translation createTranslation(String text, Language language) {
        Translation translation = Translation.builder()
                .originalText(text)
                .originalLanguage(language)
                .translations(new HashMap<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return translationRepository.save(translation);
    }

    public Translation getTranslation(String id) {
        return translationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Translation not found with id: " + id));
    }

    public String getTranslatedText(String translationId, Language targetLanguage) {
        Translation translation = translationRepository.findById(translationId)
                .orElseThrow(() -> new RuntimeException("Translation not found"));

        if (targetLanguage == translation.getOriginalLanguage()) {
            return translation.getOriginalText();
        }

        return translation.getTranslations().getOrDefault(targetLanguage, translation.getOriginalText());
    }
} 