package com.dftm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
import com.dftm.model.Language;
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
    private final MessageSource messageSource;
    private final PendingTaskRepository pendingTaskRepository;
    private final TaskRepository taskRepository;

    private String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
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
            @RequestParam(required = false) Language language,
            @RequestParam(required = false, defaultValue = "false") Boolean archived) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("GET /tasks request. User: {}, Authorities: {}", 
            auth.getName(), 
            auth.getAuthorities());
        
        List<Task> tasks = archived ? taskService.getAllTasks() : taskService.getNonArchivedTasks();
        log.info("Found {} tasks", tasks.size());
        
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(
            @PathVariable String taskId,
            @RequestParam(required = false) Language language) {
        
        log.debug("GET request to fetch task with ID: {}, language: {}", taskId, language);
        Task translatedTask = taskService.getTranslatedTask(taskId, language);
        translatedTask.setStatusDisplay(getMessage("status." + translatedTask.getStatus().name()));
        translatedTask.setPriorityDisplay(getMessage("priority." + translatedTask.getPriority().name()));
        return ResponseEntity.ok(translatedTask);
    }
    
    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(
            @PathVariable String taskId,
            @Valid @RequestBody TaskRequest taskRequest) {
        
        log.debug("PUT request to update task with ID: {}", taskId);
        Task updatedTask = taskService.updateTask(taskId, taskRequest);
        return ResponseEntity.ok()
                .header("X-Message", getMessage("task.updated"))
                .body(updatedTask);
    }
    
    @PutMapping("/{taskId}/status/{status}")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable String taskId,
            @PathVariable TaskStatus status) {
            
        log.debug("PUT request to update task status, ID: {}, new status: {}", taskId, status);
        Task updatedTask = taskService.updateTaskStatus(taskId, status);
        return ResponseEntity.ok()
                .header("X-Message", getMessage("task.status.updated"))
                .body(updatedTask);
    }
    
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable String taskId) {
        log.debug("DELETE request to delete task with ID: {}", taskId);
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{taskId}/archive")
    public ResponseEntity<Task> archiveTask(@PathVariable String taskId) {
        log.debug("PUT request to archive task with ID: {}", taskId);
        Task archivedTask = taskService.archiveTask(taskId);
        return ResponseEntity.ok()
                .header("X-Message", getMessage("task.archived"))
                .body(archivedTask);
    }
    
    @PutMapping("/{taskId}/unarchive")
    public ResponseEntity<Task> unarchiveTask(@PathVariable String taskId) {
        log.debug("PUT request to unarchive task with ID: {}", taskId);
        Task unarchivedTask = taskService.unarchiveTask(taskId);
        return ResponseEntity.ok()
                .header("X-Message", getMessage("task.unarchived"))
                .body(unarchivedTask);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getTasksByAssignedTo(
            @PathVariable String userId,
            @RequestParam(required = false) Language language,
            @RequestParam(required = false, defaultValue = "false") Boolean archived) {
            
        log.debug("GET request to fetch tasks assigned to user: {}, archived: {}, language: {}", 
                userId, archived, language);
                
        List<Task> tasks = taskService.getTasksByAssignedToAndArchived(userId, archived);
        
        List<Task> translatedTasks = tasks.stream()
            .map(task -> {
                Task translatedTask = taskService.getTranslatedTask(task.getId(), language);
                translatedTask.setStatusDisplay(getMessage("status." + translatedTask.getStatus().name()));
                translatedTask.setPriorityDisplay(getMessage("priority." + translatedTask.getPriority().name()));
                return translatedTask;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(translatedTasks);
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<Task>> getPendingTasks(
            @RequestParam(required = false) Language language) {
            
        log.debug("GET request to fetch pending tasks, language: {}", language);
        
        List<Task> tasks = taskService.getTasksByStatus(TaskStatus.PENDING);
        
        List<Task> translatedTasks = tasks.stream()
            .map(task -> {
                Task translatedTask = taskService.getTranslatedTask(task.getId(), language);
                translatedTask.setStatusDisplay(getMessage("status." + translatedTask.getStatus().name()));
                translatedTask.setPriorityDisplay(getMessage("priority." + translatedTask.getPriority().name()));
                return translatedTask;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(translatedTasks);
    }
    
    @PostMapping("/{taskId}/approve")
    public ResponseEntity<Task> approveTask(@PathVariable String taskId) {
        log.debug("POST request to approve task with ID: {}", taskId);
        Task approvedTask = taskService.approveTask(taskId);
        return ResponseEntity.ok()
                .header("X-Message", getMessage("task.approved"))
                .body(approvedTask);
    }
    
    @PostMapping("/{id}/approve-pending")
    public ResponseEntity<Void> approvePendingTask(@PathVariable String id) {
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
                .originalLanguage(pendingTask.getOriginalLanguage())
                .build();

            taskRepository.save(task);
            
            pendingTask.setStatus(TaskStatus.APPROVED.toString());
            pendingTaskRepository.save(pendingTask);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to approve task: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
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
            return ResponseEntity.badRequest().build();
        }
    }
} 