package com.dftm.dto;

import java.time.LocalDateTime;

import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TaskRequest {
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private String assignedTo;
    private LocalDateTime dueDate;
} 