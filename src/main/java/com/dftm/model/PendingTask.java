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
@Document(collection = "pendingTasks")
public class PendingTask {
    @Id
    private String id;
    private String title;
    private String description;
    private String reporter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean assigned;
} 