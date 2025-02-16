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
    private String translationId;  // Referens till översättning
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
        return this.translationId;
    }

    public String getText() {
        return this.text;
    }
} 