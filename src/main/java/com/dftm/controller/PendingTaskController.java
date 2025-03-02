package com.dftm.controller;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.model.PendingTask;
import com.dftm.repository.PendingTaskRepository;
import com.dftm.service.PendingTaskService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/pending-tasks")
@RequiredArgsConstructor
@Slf4j
public class PendingTaskController {
    private final PendingTaskService pendingTaskService;
    private final PendingTaskRepository pendingTaskRepository;

    @GetMapping
    public ResponseEntity<List<PendingTask>> getAllPendingTasks(
            @RequestParam(required = false) Boolean assigned,
            @RequestParam(required = false) Boolean approved) {
        log.info("GET /api/v1/pending-tasks - Fetching pending tasks with filters - assigned: {}, approved: {}", assigned, approved);
        
        List<PendingTask> result;
        if (assigned != null && approved != null) {
            result = pendingTaskService.getPendingTasksByAssignedAndApproved(assigned, approved);
        } else if (assigned != null) {
            result = pendingTaskService.getPendingTasksByAssigned(assigned);
        } else if (approved != null) {
            result = pendingTaskService.getPendingTasksByApproved(approved);
        } else {
            // Inga filter angivna, returnera alla
            result = pendingTaskService.getAllPendingTasks();
        }
        
        log.info("Found {} pending tasks to return", result.size());
        for (PendingTask task : result) {
            log.info("Task: {}", task);
        }
        
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<PendingTask> approvePendingTask(
            @PathVariable String id,
            @RequestParam String assignedToUserId,
            @RequestParam String assignedByUserId) {
        log.debug("Approving pending task with id: {}", id);
        PendingTask approvedTask = pendingTaskService.approvePendingTask(id, assignedToUserId, assignedByUserId);
        return ResponseEntity.ok(approvedTask);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPendingTaskById(@PathVariable String id) {
        log.info("GET /api/v1/pending-tasks/{} - Fetching pending task by ID", id);
        
        try {
            Optional<PendingTask> taskOptional = pendingTaskService.findById(id);
            
            if (taskOptional.isPresent()) {
                PendingTask task = taskOptional.get();
                log.info("Found pending task with ID {}: {}", id, task);
                return ResponseEntity.ok(task);
            } else {
                log.warn("Pending task with ID {} not found", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Pending task not found", "id", id));
            }
        } catch (Exception e) {
            log.error("Error fetching pending task with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch pending task", "message", e.getMessage()));
        }
    }

    @GetMapping("/test-db-connection")
    public ResponseEntity<?> testDatabaseConnection() {
        log.info("Testing MongoDB connection and collection access");
        
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test 1: Kan vi räkna alla dokument?
            long count = pendingTaskRepository.count();
            result.put("count", count);
            log.info("Total documents in collection: {}", count);
            
            // Test 2: Kollektionsnamn
            result.put("pendingTasksCollection", "pendingTasks");
            
            // Test 3: Skapa, spara och sedan leta efter en uppgift med ett unikt ID
            String uniqueId = "test-" + System.currentTimeMillis();
            
            // Skapa utan builder
            PendingTask testTask = new PendingTask();
            testTask.setTitle("DB Test Task");
            testTask.setDescription("Testing database connectivity");
            testTask.setStatus("PENDING");
            testTask.setPriority("LOW");
            testTask.setMessageId(uniqueId);
            testTask.setSender("system");
            testTask.setRecipient("system");
            testTask.setReporter("system");
            testTask.setAssigned(false);
            testTask.setApproved(false);
            testTask.setCreatedAt(LocalDateTime.now());
            testTask.setUpdatedAt(LocalDateTime.now());
            
            PendingTask savedTask = pendingTaskRepository.save(testTask);
            result.put("savedTask", savedTask);
            log.info("Task saved with ID: {}", savedTask.getId());
            
            // Test 4: Hämta den nyskapade uppgiften med messageId
            Optional<PendingTask> foundByMessageId = pendingTaskRepository.findByMessageId(uniqueId);
            result.put("foundByMessageId", foundByMessageId.isPresent());
            log.info("Task found by messageId: {}", foundByMessageId.isPresent());
            
            if (foundByMessageId.isPresent()) {
                log.info("Found task details: {}", foundByMessageId.get());
            }
            
            // Test 5: Hämta den nyskapade uppgiften med ID
            Optional<PendingTask> foundById = pendingTaskRepository.findById(savedTask.getId());
            result.put("foundById", foundById.isPresent());
            log.info("Task found by ID: {}", foundById.isPresent());
            
            if (foundById.isPresent()) {
                log.info("Found task details: {}", foundById.get());
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error testing database connection: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Database connection test failed",
                    "message", e.getMessage(),
                    "stackTrace", Arrays.toString(e.getStackTrace())
                ));
        }
    }

    @GetMapping("/test-create")
    public ResponseEntity<?> createTestPendingTask() {
        log.info("Creating test pending task to check database connectivity");
        
        try {
            // Skapa en ny test PendingTask utan builder
            PendingTask testTask = new PendingTask();
            testTask.setTitle("Test Pending Task");
            testTask.setDescription("Test description to check database connectivity");
            testTask.setStatus("PENDING");
            testTask.setPriority("MEDIUM");
            testTask.setSender("test-sender");
            testTask.setRecipient("test-recipient");
            testTask.setReporter("test-reporter");
            testTask.setMessageId("test-message-" + System.currentTimeMillis());
            testTask.setAssigned(false);
            testTask.setApproved(false);
            testTask.setCreatedAt(LocalDateTime.now());
            testTask.setUpdatedAt(LocalDateTime.now());
            
            // Spara till databasen
            PendingTask savedTask = pendingTaskRepository.save(testTask);
            log.info("Test task successfully saved with ID: {}", savedTask.getId());
            
            // Dubbelkolla om den sparades genom att hämta den igen
            List<PendingTask> allTasks = pendingTaskRepository.findAll();
            log.info("Total tasks after test creation: {}", allTasks.size());
            
            return ResponseEntity.ok(Map.of(
                "message", "Test task created successfully",
                "task", savedTask,
                "totalTasks", allTasks.size()
            ));
        } catch (Exception e) {
            log.error("Error creating test task: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create test task", "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<PendingTask> createPendingTask(@RequestBody PendingTask pendingTask) {
        log.info("POST /api/v1/pending-tasks - Creating new pending task");
        
        try {
            // Sätt automatiska datumfält
            LocalDateTime now = LocalDateTime.now();
            pendingTask.setCreatedAt(now);
            pendingTask.setUpdatedAt(now);
            
            // Spara till databasen
            PendingTask savedTask = pendingTaskRepository.save(pendingTask);
            log.info("Pending task successfully created with ID: {}", savedTask.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
        } catch (Exception e) {
            log.error("Error creating pending task: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create pending task: " + e.getMessage(), e);
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<PendingTask> updatePendingTask(
            @PathVariable String id,
            @RequestBody PendingTask taskData) {
        log.info("PATCH /api/v1/pending-tasks/{} - Updating pending task", id);
        
        try {
            Optional<PendingTask> existingTaskOptional = pendingTaskRepository.findById(id);
            
            if (existingTaskOptional.isEmpty()) {
                log.warn("Pending task with ID {} not found for update", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .build();
            }
            
            PendingTask existingTask = existingTaskOptional.get();
            
            // Uppdatera bara de fält som finns i request body
            if (taskData.getTitle() != null) {
                existingTask.setTitle(taskData.getTitle());
            }
            if (taskData.getDescription() != null) {
                existingTask.setDescription(taskData.getDescription());
            }
            if (taskData.getStatus() != null) {
                existingTask.setStatus(taskData.getStatus());
            }
            if (taskData.getPriority() != null) {
                existingTask.setPriority(taskData.getPriority());
            }
            
            existingTask.setUpdatedAt(LocalDateTime.now());
            
            PendingTask updatedTask = pendingTaskRepository.save(existingTask);
            log.info("Successfully updated pending task with ID {}", id);
            
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            log.error("Error updating pending task with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<PendingTask> updatePendingTaskStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusMap) {
        log.info("PATCH /api/v1/pending-tasks/{}/status - Updating pending task status", id);
        
        try {
            String status = statusMap.get("status");
            if (status == null) {
                log.warn("No status provided in request body");
                return ResponseEntity.badRequest().build();
            }
            
            Optional<PendingTask> existingTaskOptional = pendingTaskRepository.findById(id);
            
            if (existingTaskOptional.isEmpty()) {
                log.warn("Pending task with ID {} not found for status update", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .build();
            }
            
            PendingTask existingTask = existingTaskOptional.get();
            existingTask.setStatus(status);
            existingTask.setUpdatedAt(LocalDateTime.now());
            
            PendingTask updatedTask = pendingTaskRepository.save(existingTask);
            log.info("Successfully updated status of pending task with ID {} to {}", id, status);
            
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            log.error("Error updating status of pending task with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
        }
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<PendingTask> updatePendingTaskPriority(
            @PathVariable String id,
            @RequestBody Map<String, String> priorityMap) {
        log.info("PATCH /api/v1/pending-tasks/{}/priority - Updating pending task priority", id);
        
        try {
            String priority = priorityMap.get("priority");
            if (priority == null) {
                log.warn("No priority provided in request body");
                return ResponseEntity.badRequest().build();
            }
            
            Optional<PendingTask> existingTaskOptional = pendingTaskRepository.findById(id);
            
            if (existingTaskOptional.isEmpty()) {
                log.warn("Pending task with ID {} not found for priority update", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .build();
            }
            
            PendingTask existingTask = existingTaskOptional.get();
            existingTask.setPriority(priority);
            existingTask.setUpdatedAt(LocalDateTime.now());
            
            PendingTask updatedTask = pendingTaskRepository.save(existingTask);
            log.info("Successfully updated priority of pending task with ID {} to {}", id, priority);
            
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            log.error("Error updating priority of pending task with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
        }
    }
} 