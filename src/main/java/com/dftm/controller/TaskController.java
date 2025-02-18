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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Task> createTask(@RequestBody TaskRequest request) {
        Task task = request.toTask();
        return ResponseEntity.ok(taskService.createTask(task));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Task> getTask(@PathVariable String id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Task>> getAllTasks() {
        log.error("\033[0;33m Attempting to fetch all tasks... \033[0m");
        try {
            var tasks = taskService.getAllTasks();
            log.error("\033[0;32m Successfully fetched {} tasks \033[0m", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("\033[0;31m Failed to fetch tasks: {} \033[0m", e.getMessage());
            throw e;
        }
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