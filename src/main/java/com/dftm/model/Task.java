package com.dftm.model;

import java.time.LocalDateTime;
import java.util.List;
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
@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    private String title;
    private String description;
    private String reporter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean assigned;
    private TaskStatus status;
    private Map<Language, String> titleTranslations;
    private Map<Language, String> descriptionTranslations;
    private String originalLanguage;
    private String descriptionTranslationId;  // Referens till översättning
    private TaskPriority priority;
    private String assignee;    // Person som ska utföra uppgiften
    private String assigner;    // Admin som tilldelade uppgiften
    private LocalDateTime dueDate;
    private List<Comment> comments;

    // Lägg till dessa metoder om de saknas
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public void setAssigner(String assigner) {
        this.assigner = assigner;
    }

    public String getAssignee() {
        return this.assignee;
    }

    public String getTitle() {
        return this.title;
    }

    public String getDescription() {
        return this.description;
    }

    public List<Comment> getComments() {
        return this.comments;
    }
} 