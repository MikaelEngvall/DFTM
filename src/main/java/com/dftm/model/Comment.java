package com.dftm.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;
    private String taskId;
    private String text;
    private String textTranslationId;  // Referens till översättning
    private String userId;
    private String userName;  // Användarens visningsnamn
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Builder.Default
    private Language originalLanguage = Language.SV;  // Standardspråk för kommentaren
    
    @Builder.Default
    private Map<Language, String> textTranslations = new HashMap<>();

    public static Comment createNew(String taskId, String text, String userId) {
        LocalDateTime now = LocalDateTime.now();
        return Comment.builder()
            .taskId(taskId)
            .text(text)
            .userId(userId)
            .createdAt(now)
            .updatedAt(now)
            .originalLanguage(Language.SV)
            .build();
    }
    
    public static Comment createNew(String taskId, String text, String userId, String userName) {
        LocalDateTime now = LocalDateTime.now();
        return Comment.builder()
            .taskId(taskId)
            .text(text)
            .userId(userId)
            .userName(userName)
            .createdAt(now)
            .updatedAt(now)
            .originalLanguage(Language.SV)
            .build();
    }
    
    public String getTextTranslationId() {
        return this.textTranslationId;
    }
    
    public Language getOriginalLanguage() {
        return this.originalLanguage;
    }
    
    public void setTextTranslationId(String textTranslationId) {
        this.textTranslationId = textTranslationId;
    }
} 