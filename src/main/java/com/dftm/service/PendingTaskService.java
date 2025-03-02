package com.dftm.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dftm.model.PendingTask;
import com.dftm.model.Task;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;
import com.dftm.repository.PendingTaskRepository;
import com.dftm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PendingTaskService {
    private final PendingTaskRepository pendingTaskRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;

    public List<PendingTask> getAllPendingTasks() {
        log.debug("Fetching all pending tasks from database");
        List<PendingTask> pendingTasks = pendingTaskRepository.findAll();
        log.info("Found {} pending tasks", pendingTasks.size());
        return pendingTasks;
    }

    public List<PendingTask> getPendingTasksByActiveAndProcessed(Boolean active, Boolean processed) {
        log.debug("Fetching pending tasks with active={} and processed={}", active, processed);
        return pendingTaskRepository.findByActiveAndProcessed(active, processed);
    }

    public List<PendingTask> getPendingTasksByActive(Boolean active) {
        log.debug("Fetching pending tasks with active={}", active);
        return pendingTaskRepository.findByActive(active);
    }

    public List<PendingTask> getPendingTasksByProcessed(Boolean processed) {
        log.debug("Fetching pending tasks with processed={}", processed);
        return pendingTaskRepository.findByProcessed(processed);
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