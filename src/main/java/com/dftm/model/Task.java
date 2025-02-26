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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {
    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;
    private String titleTranslationId;

    @NotBlank(message = "Description is required")
    private String description;
<<<<<<< HEAD
    private String descriptionTranslationId;

    @NotNull(message = "Status is required")
    private TaskStatus status;
    private String statusDisplay; // För översatt status

    @NotNull(message = "Priority is required")
=======
    private String reporter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean assigned;
    private TaskStatus status;
    private Map<Language, String> titleTranslations;
    private Map<Language, String> descriptionTranslations;
    private String originalLanguage;
    private String descriptionTranslationId;  // Referens till översättning
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
    private TaskPriority priority;
    private String priorityDisplay; // För översatt prioritet

    @NotBlank(message = "AssignedTo is required")
    private String assignedTo;    // Person som ska utföra uppgiften
    private String assigner;    // Admin som tilldelade uppgiften
<<<<<<< HEAD
    private String reporter;    // Person som anmälde felet

    @NotNull(message = "DueDate is required")
    private LocalDateTime dueDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
=======
    private LocalDateTime dueDate;
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
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