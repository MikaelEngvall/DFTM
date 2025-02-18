package com.dftm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
import com.dftm.model.PendingTask;
import com.dftm.model.Task;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;
import com.dftm.repository.PendingTaskRepository;
import com.dftm.repository.TaskRepository;
import com.dftm.service.TaskService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {
    private final TaskService taskService;
    private final TaskRepository taskRepository;
    private final PendingTaskRepository pendingTaskRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
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
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'SUPERADMIN')")
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