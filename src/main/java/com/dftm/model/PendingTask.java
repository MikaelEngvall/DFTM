package com.dftm.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "pendingTasks")
public class PendingTask {
    @Id
    private String id;
    private String title;
    private String description;
    private String reporter;
<<<<<<< HEAD
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean assigned;
    @Builder.Default
    private boolean approved = false;  // Standardvärde false för nya pending tasks
    @Builder.Default
=======
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
    private Map<Language, String> titleTranslations = new HashMap<>();
    @Builder.Default
    private Map<Language, String> descriptionTranslations = new HashMap<>();
<<<<<<< HEAD
    @Builder.Default
    private Language originalLanguage = Language.SV; // Default till svenska
=======
    private Language originalLanguage = Language.SV;
    private String status = TaskStatus.PENDING.toString();
    private String priority = TaskPriority.MEDIUM.toString();
    private boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
} 