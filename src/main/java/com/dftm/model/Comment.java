package com.dftm.model;

import java.time.LocalDateTime;
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
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Comment createNew(String taskId, String text, String userId) {
        LocalDateTime now = LocalDateTime.now();
        return Comment.builder()
            .taskId(taskId)
            .text(text)
            .userId(userId)
            .createdAt(now)
            .updatedAt(now)
            .build();
    }
} 