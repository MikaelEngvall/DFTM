package com.dftm.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

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
    private String textTranslationId;  // Referens till översättning av kommentartexten
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Language originalLanguage = Language.SV;  // Standardspråk för kommentaren

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getTranslationId() {
        return this.textTranslationId;
    }

    public String getText() {
        return this.text;
    }
} 