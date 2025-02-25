package com.dftm.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.dftm.model.Task;
import com.dftm.model.TaskStatus;
import com.dftm.model.Language;
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

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        log.debug("POST request to create task");
        return ResponseEntity.ok(taskService.createTask(task));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) Boolean archived,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false, defaultValue = "SV") Language language) {
        log.debug("GET request to fetch all tasks, archived: {}, assignedTo: {}, language: {}", 
            archived, assignedTo, language);
        
        List<Task> tasks = taskService.getAllTasks(archived, assignedTo);
        
        // Översätt alla uppgifter till önskat språk
        List<Task> translatedTasks = tasks.stream()
            .map(task -> taskService.getTranslatedTask(task.getId(), language))
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
        return ResponseEntity.ok(translatedTask);
    }

    @PutMapping("/{taskId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN') or @taskService.isAssignedToUser(#taskId, authentication.principal.id)")
    public ResponseEntity<Task> updateTask(
            @PathVariable String taskId,
            @Valid @RequestBody Task task) {
        log.debug("PUT request to update task with ID: {}", taskId);
        return ResponseEntity.ok(taskService.updateTask(taskId, task));
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Void> archiveTask(@PathVariable String taskId) {
        log.debug("DELETE request to archive task with ID: {}", taskId);
        taskService.archiveTask(taskId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{taskId}/approve")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Task> approveTask(@PathVariable String taskId) {
        log.debug("POST request to approve task with ID: {}", taskId);
        return ResponseEntity.ok(taskService.approveTask(taskId));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Task> assignTask(
            @PathVariable String id, 
            @RequestParam String assignee, 
            @RequestParam(required = false) String assigner) {
        log.error("\033[0;33m Attempting to assign task {} to {} \033[0m", id, assignee);
        try {
            var task = taskService.assignTask(id, assignee, assigner);
            log.error("\033[0;32m Successfully assigned task \033[0m");
            return ResponseEntity.ok(task);
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
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }
} 