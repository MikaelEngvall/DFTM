package com.dftm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
        try {
            List<PendingTask> pendingTasks = pendingTaskRepository.findAll();
            log.info("Found {} pending tasks", pendingTasks.size());
            if (pendingTasks.isEmpty()) {
                log.warn("No pending tasks found in database. Collection may be empty or not accessible.");
            } else {
                // Logga några detaljer om första uppgiften för att bekräfta att det hämtas korrekt
                PendingTask firstTask = pendingTasks.get(0);
                log.info("First task details - ID: {}, Title: {}, Assigned: {}, Approved: {}", 
                        firstTask.getId(), firstTask.getTitle(), firstTask.isAssigned(), firstTask.isApproved());
            }
            return pendingTasks;
        } catch (Exception e) {
            log.error("Error while fetching pending tasks: {}", e.getMessage(), e);
            return List.of(); // Returnera en tom lista vid fel
        }
    }

    public List<PendingTask> getPendingTasksByAssignedAndApproved(Boolean assigned, Boolean approved) {
        log.debug("Fetching pending tasks with assigned={} and approved={}", assigned, approved);
        return pendingTaskRepository.findByAssignedAndApproved(assigned, approved);
    }

    public List<PendingTask> getPendingTasksByAssigned(Boolean assigned) {
        log.debug("Fetching pending tasks with assigned={}", assigned);
        return pendingTaskRepository.findByAssigned(assigned);
    }

    public List<PendingTask> getPendingTasksByApproved(Boolean approved) {
        log.debug("Fetching pending tasks with approved={}", approved);
        return pendingTaskRepository.findByApproved(approved);
    }

    public PendingTask approvePendingTask(String pendingTaskId, String assignedToUserId, String assignedByUserId, LocalDateTime customDueDate) {
        PendingTask pendingTask = pendingTaskRepository.findById(pendingTaskId)
                .orElseThrow(() -> new RuntimeException("Pending task not found"));

        // Verifiera att användarna finns
        userService.getUserById(assignedToUserId);
        userService.getUserById(assignedByUserId);

        // Markera pending task som approved
        pendingTask.setApproved(true);
        PendingTask savedPendingTask = pendingTaskRepository.save(pendingTask);

        // Konvertera status från sträng till enum
        TaskStatus taskStatus;
        try {
            taskStatus = TaskStatus.valueOf(pendingTask.getStatus());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status value in pending task: {}. Using default PENDING", pendingTask.getStatus());
            taskStatus = TaskStatus.PENDING;
        }

        // Konvertera priority från sträng till enum
        TaskPriority taskPriority;
        try {
            taskPriority = TaskPriority.valueOf(pendingTask.getPriority());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid priority value in pending task: {}. Using default MEDIUM", pendingTask.getPriority());
            taskPriority = TaskPriority.MEDIUM;
        }

        // Använd custom dueDate om det angivits, annars använd pendingTask dueDate om det finns,
        // annars sätt det till 7 dagar framåt
        LocalDateTime dueDate;
        if (customDueDate != null) {
            dueDate = customDueDate;
            log.debug("Using custom dueDate: {}", dueDate);
        } else if (pendingTask.getDueDate() != null) {
            dueDate = pendingTask.getDueDate();
            log.debug("Using pendingTask dueDate: {}", dueDate);
        } else {
            dueDate = LocalDateTime.now().plusDays(7);
            log.debug("Using default dueDate (now+7days): {}", dueDate);
        }

        // Skapa ny task baserad på pending task
        Task newTask = Task.builder()
                .title(pendingTask.getTitle())
                .description(pendingTask.getDescription())
                .status(taskStatus)
                .priority(taskPriority)
                .dueDate(dueDate)
                .assignedTo(assignedToUserId)
                .assigner(assignedByUserId)
                .reporter(pendingTask.getReporter())
                .createdAt(pendingTask.getCreatedAt())
                .updatedAt(pendingTask.getUpdatedAt())
                .originalLanguage(pendingTask.getOriginalLanguage())
                .approved(true)
                .build();

        Task savedTask = taskRepository.save(newTask);
        log.info("Created new task from approved pending task: {}", savedTask.getId());

        return savedPendingTask;
    }

    /**
     * Hämtar en specifik PendingTask med ID
     */
    public Optional<PendingTask> findById(String id) {
        log.debug("Fetching pending task with ID: {}", id);
        try {
            Optional<PendingTask> task = pendingTaskRepository.findById(id);
            if (task.isPresent()) {
                log.info("Found pending task with ID {}", id);
            } else {
                log.warn("No pending task found with ID {}", id);
            }
            return task;
        } catch (Exception e) {
            log.error("Error fetching pending task with ID {}: {}", id, e.getMessage(), e);
            return Optional.empty();
        }
    }
} 