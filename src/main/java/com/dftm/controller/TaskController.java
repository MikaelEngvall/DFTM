package com.dftm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.dto.TaskRequest;
<<<<<<< HEAD
import com.dftm.model.Language;
=======
import com.dftm.model.PendingTask;
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
import com.dftm.model.Task;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;
import com.dftm.repository.PendingTaskRepository;
import com.dftm.repository.TaskRepository;
import com.dftm.service.TaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {
    private final TaskService taskService;
<<<<<<< HEAD
    private final MessageSource messageSource;

    private String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
=======
    private final TaskRepository taskRepository;
    private final PendingTaskRepository pendingTaskRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Task> createTask(@RequestBody TaskRequest request) {
        Task task = request.toTask();
        return ResponseEntity.ok(taskService.createTask(task));
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        log.debug("POST request to create task");
        Task task = Task.createNewTask(
            taskRequest.getTitle(),
            taskRequest.getDescription(),
            taskRequest.getStatus(),
            taskRequest.getPriority(),
            taskRequest.getAssignedTo(),
            taskRequest.getDueDate()
        );
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("task.created"))
            .body(createdTask);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) Boolean archived,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false, defaultValue = "SV") Language language) {
        log.debug("GET request to fetch all tasks, archived: {}, assignedTo: {}, language: {}", 
            archived, assignedTo, language);
        
        List<Task> tasks = taskService.getAllTasks(archived, assignedTo);
        List<Task> translatedTasks = tasks.stream()
            .map(task -> {
                Task translatedTask = taskService.getTranslatedTask(task.getId(), language);
                // Översätt status och prioritet
                translatedTask.setStatusDisplay(getMessage("status." + translatedTask.getStatus().name()));
                translatedTask.setPriorityDisplay(getMessage("priority." + translatedTask.getPriority().name()));
                return translatedTask;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(translatedTasks);
    }

    @GetMapping("/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> getTaskById(
            @PathVariable String taskId,
            @RequestParam(required = false, defaultValue = "SV") Language language) {
        log.debug("GET request to fetch task with ID: {}, language: {}", taskId, language);
        Task translatedTask = taskService.getTranslatedTask(taskId, language);
        translatedTask.setStatusDisplay(getMessage("status." + translatedTask.getStatus().name()));
        translatedTask.setPriorityDisplay(getMessage("priority." + translatedTask.getPriority().name()));
        return ResponseEntity.ok(translatedTask);
    }

    @PutMapping("/{taskId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN') or @taskService.isAssignedToUser(#taskId, authentication.principal.id)")
    public ResponseEntity<Task> updateTask(
            @PathVariable String taskId,
            @Valid @RequestBody Task task) {
        log.debug("PUT request to update task with ID: {}", taskId);
        Task updatedTask = taskService.updateTask(taskId, task);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("task.updated"))
            .body(updatedTask);
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Void> archiveTask(@PathVariable String taskId) {
        log.debug("DELETE request to archive task with ID: {}", taskId);
        taskService.archiveTask(taskId);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("task.deleted"))
            .build();
    }

    @PostMapping("/{taskId}/approve")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Task> approveTask(@PathVariable String taskId) {
        log.debug("POST request to approve task with ID: {}", taskId);
        Task approvedTask = taskService.approveTask(taskId);
        return ResponseEntity.ok()
            .header("X-Message", getMessage("task.updated"))
            .body(approvedTask);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Task> assignTask(
            @PathVariable String id, 
            @RequestParam String assignee, 
            @RequestParam(required = false) String assigner) {
        log.error("\033[0;33m Attempting to assign task {} to {} \033[0m", id, assignee);
        try {
            Task task = taskService.assignTask(id, assignee, assigner);
            log.error("\033[0;32m Successfully assigned task \033[0m");
            return ResponseEntity.ok()
                .header("X-Message", getMessage("task.updated"))
                .body(task);
        } catch (Exception e) {
            log.error("\033[0;31m Failed to assign task: {} \033[0m", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/assignee/{assignee}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<Task>> getTasksByAssignee(@PathVariable String assignee) {
        return ResponseEntity.ok(taskService.getTasksByAssignedTo(assignee));
    }

    @GetMapping("/assigner/{assigner}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Task>> getTasksByAssigner(@PathVariable String assigner) {
        return ResponseEntity.ok(taskService.getTasksByAssigner(assigner));
    }

    @GetMapping("/status/{status}")
<<<<<<< HEAD
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
=======
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'SUPERADMIN')")
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable TaskStatus status) {
        log.info("Fetching tasks with status: {}, Current user authorities: {}", 
            status, SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        try {
            List<Task> tasks = taskService.getTasksByStatus(status);
            log.info("Found {} tasks with status {}", tasks.size(), status);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error fetching tasks with status {}: {}", status, e.getMessage());
            throw e;
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingTask>> getPendingTasks() {
        log.info("Fetching pending tasks...");
        try {
            List<PendingTask> pendingTasks = pendingTaskRepository.findAll();
            log.info("Found {} pending tasks", pendingTasks.size());
            
            List<PendingTask> activePendingTasks = pendingTasks.stream()
                .filter(PendingTask::isActive)
                .filter(task -> TaskStatus.PENDING.toString().equals(task.getStatus()))
                .collect(Collectors.toList());
            
            log.info("Found {} active pending tasks", activePendingTasks.size());
            return ResponseEntity.ok(activePendingTasks);
        } catch (Exception e) {
            log.error("Error fetching pending tasks: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveTask(@PathVariable String id) {
        try {
            var pendingTask = pendingTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pending task not found"));
            
            Task task = Task.builder()
                .title(pendingTask.getTitle())
                .description(pendingTask.getDescription())
                .reporter(pendingTask.getReporter())
                .status(TaskStatus.APPROVED)
                .priority(TaskPriority.valueOf(pendingTask.getPriority()))
                .createdAt(pendingTask.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .assigned(false)
                .titleTranslations(pendingTask.getTitleTranslations())
                .descriptionTranslations(pendingTask.getDescriptionTranslations())
                .originalLanguage(pendingTask.getOriginalLanguage().getCode())
                .build();

            taskRepository.save(task);
            
            pendingTask.setStatus(TaskStatus.APPROVED.toString());
            pendingTaskRepository.save(pendingTask);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to approve task: {}", e.getMessage());
            throw new RuntimeException("Failed to approve task", e);
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectTask(@PathVariable String id) {
        try {
            var task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
            task.setStatus(TaskStatus.REJECTED);
            taskRepository.save(task);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to reject task: {}", e.getMessage());
            throw new RuntimeException("Failed to reject task", e);
        }
    }
} 