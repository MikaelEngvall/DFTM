package com.dftm.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

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
    private String titleTranslationId;  // Referens till översättning av titeln
    private String description;
    private String descriptionTranslationId;  // Referens till översättning av beskrivningen
    @Field(targetType = FieldType.STRING)
    private TaskStatus status;
    private TaskPriority priority;
    private String assignedTo;    // Person som ska utföra uppgiften
    private String assigner;    // Admin som tilldelade uppgiften
    private String reporter;    // Person som anmälde felet
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Comment> comments;
    private boolean archived;
    @Builder.Default
    private boolean approved = true;  // Standardvärde för approved är true
    @Builder.Default
    private Language originalLanguage = Language.SV;  // Standardspråk för uppgiften

    public static Task createNewTask(String title, String description, TaskStatus status, TaskPriority priority, String assignedTo, LocalDateTime dueDate) {
        return Task.builder()
                .title(title)
                .description(description)
                .status(status)
                .priority(priority)
                .assignedTo(assignedTo)
                .dueDate(dueDate)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .archived(false)
                .approved(true)  // Sätt alltid approved till true för nya uppgifter
                .originalLanguage(Language.SV)
                .build();
    }

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

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setAssigner(String assigner) {
        this.assigner = assigner;
    }

    public String getAssignedTo() {
        return this.assignedTo;
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

    public boolean isArchived() {
        return this.archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public boolean isApproved() {
        return this.approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }
} 