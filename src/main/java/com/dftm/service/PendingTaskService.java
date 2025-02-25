package com.dftm.service;

import com.dftm.model.PendingTask;
import com.dftm.model.Task;
import com.dftm.model.User;
import com.dftm.model.TaskStatus;
import com.dftm.model.TaskPriority;
import com.dftm.repository.PendingTaskRepository;
import com.dftm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PendingTaskService {
    private final PendingTaskRepository pendingTaskRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;

    public List<PendingTask> getAllPendingTasks() {
        log.debug("Fetching all pending tasks from database");
        return pendingTaskRepository.findAll();
    }

    public PendingTask approvePendingTask(String pendingTaskId, String assignedToUserId, String assignedByUserId) {
        PendingTask pendingTask = pendingTaskRepository.findById(pendingTaskId)
                .orElseThrow(() -> new RuntimeException("Pending task not found"));

        // Verifiera att användarna finns
        userService.getUserById(assignedToUserId);
        userService.getUserById(assignedByUserId);

        // Markera pending task som approved
        pendingTask.setApproved(true);
        PendingTask savedPendingTask = pendingTaskRepository.save(pendingTask);

        // Skapa ny task baserad på pending task
        Task newTask = Task.builder()
                .title(pendingTask.getTitle())
                .description(pendingTask.getDescription())
                .status(TaskStatus.PENDING)
                .priority(TaskPriority.MEDIUM)
                .dueDate(null)
                .assignedTo(assignedToUserId)
                .assigner(assignedByUserId)
                .reporter(pendingTask.getReporter())
                .createdAt(pendingTask.getCreatedAt())
                .updatedAt(pendingTask.getUpdatedAt())
                .originalLanguage(pendingTask.getOriginalLanguage())
                .approved(true)
                .build();

        taskRepository.save(newTask);
        log.info("Created new task from approved pending task: {}", newTask.getId());

        return savedPendingTask;
    }
} 