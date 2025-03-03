package com.dftm.model;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

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
@Document(collection = "pendingTasks")
public class PendingTask {
    @Id
    private String id;
    
    private String name;
    private String email;
    private String phone;
    private String address;
    private String apartment;
    private String description;
    
    // Användarfält för tilldelning
    private String assignedToUserId;
    private String assignedByUserId;
    
    // Översättningsfält
    private Language descriptionLanguage;
    @Builder.Default
    private Map<Language, String> descriptionTranslations = new HashMap<>();
    
    // Status kan vara "APPROVED" eller "REJECTED"
    private String status;
    
    // Datum då felanmälan mottogs
    private LocalDateTime received;
} 