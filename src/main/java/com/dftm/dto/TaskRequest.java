package com.dftm.dto;

import java.time.LocalDateTime;

import com.dftm.model.Task;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private String assignee;
    private LocalDateTime dueDate;

    public Task toTask() {
        return Task.builder()
                .title(title)
                .description(description)
                .status(status)
                .priority(priority)
                .assignee(assignee)
                .dueDate(dueDate)
                .build();
    }
} 