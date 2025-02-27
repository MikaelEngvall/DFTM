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
@Document(collection = "pending_tasks")
public class PendingTask {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String status;
    private String priority;
    private String sender;
    private String recipient;
    private String messageId;
    private String reporter;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private boolean active;
    private boolean processed;
    private boolean approved;
    
    private Language originalLanguage;
    
    @Builder.Default
    private Map<Language, String> titleTranslations = new HashMap<>();
    
    @Builder.Default
    private Map<Language, String> descriptionTranslations = new HashMap<>();
} 