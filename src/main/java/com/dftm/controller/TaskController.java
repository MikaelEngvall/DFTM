package com.dftm.controller;

import java.util.List;

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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        log.debug("POST request to create task");
        return ResponseEntity.ok(taskService.createTask(task));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) Boolean archived,
            @RequestParam(required = false) String assignedTo) {
        log.debug("GET request to fetch all tasks, archived: {}, assignedTo: {}", archived, assignedTo);
        return ResponseEntity.ok(taskService.getAllTasks(archived, assignedTo));
    }

    @GetMapping("/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> getTaskById(@PathVariable String taskId) {
        log.debug("GET request to fetch task with ID: {}", taskId);
        return ResponseEntity.ok(taskService.getTaskById(taskId));
    }

    @PutMapping("/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN') or @taskService.isAssignedToUser(#taskId, authentication.principal.id)")
    public ResponseEntity<Task> updateTask(
            @PathVariable String taskId,
            @Valid @RequestBody Task task) {
        log.debug("PUT request to update task with ID: {}", taskId);
        return ResponseEntity.ok(taskService.updateTask(taskId, task));
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Void> archiveTask(@PathVariable String taskId) {
        log.debug("DELETE request to archive task with ID: {}", taskId);
        taskService.archiveTask(taskId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{taskId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Task> approveTask(@PathVariable String taskId) {
        log.debug("POST request to approve task with ID: {}", taskId);
        return ResponseEntity.ok(taskService.approveTask(taskId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody TaskRequest request) {
        Task task = request.toTask();
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Task>> getTasksByAssignee(@PathVariable String assignee) {
        return ResponseEntity.ok(taskService.getTasksByAssignee(assignee));
    }

    @GetMapping("/assigner/{assigner}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Task>> getTasksByAssigner(@PathVariable String assigner) {
        return ResponseEntity.ok(taskService.getTasksByAssigner(assigner));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }
} 