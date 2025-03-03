package com.dftm.controller;

import java.time.LocalDateTime;
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
            @RequestParam(required = false) String status) {
        log.info("GET /api/v1/pending-tasks - Fetching pending tasks with filters - status: {}", status);
        
        List<PendingTask> result;
        if (status != null && !status.isEmpty()) {
            result = pendingTaskService.getPendingTasksByStatus(status);
        } else {
            // Inga filter angivna, returnera alla
            result = pendingTaskService.getAllPendingTasks();
        }
        
        log.info("Found {} pending tasks to return", result.size());
        
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<PendingTask> approvePendingTask(@PathVariable String id) {
        log.debug("Approving pending task with id: {}", id);
        
        PendingTask approvedTask = pendingTaskService.approvePendingTask(id);
        return ResponseEntity.ok(approvedTask);
    }
    
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<PendingTask> rejectPendingTask(@PathVariable String id) {
        log.debug("Rejecting pending task with id: {}", id);
        
        PendingTask rejectedTask = pendingTaskService.rejectPendingTask(id);
        return ResponseEntity.ok(rejectedTask);
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

    @PostMapping
    public ResponseEntity<PendingTask> createPendingTask(@RequestBody PendingTask pendingTask) {
        log.info("POST /api/v1/pending-tasks - Creating new pending task");
        
        try {
            // Sätt received till nu om det inte redan finns
            if (pendingTask.getReceived() == null) {
                pendingTask.setReceived(LocalDateTime.now());
            }
            
            // Sätt standardstatus om det behövs
            if (pendingTask.getStatus() == null || pendingTask.getStatus().isEmpty()) {
                pendingTask.setStatus("NEW");
            }
            
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
            
            if (existingTaskOptional.isPresent()) {
                PendingTask existingTask = existingTaskOptional.get();
                
                // Uppdatera fält om de har skickats med
                if (taskData.getName() != null) {
                    existingTask.setName(taskData.getName());
                }
                if (taskData.getEmail() != null) {
                    existingTask.setEmail(taskData.getEmail());
                }
                if (taskData.getPhone() != null) {
                    existingTask.setPhone(taskData.getPhone());
                }
                if (taskData.getAddress() != null) {
                    existingTask.setAddress(taskData.getAddress());
                }
                if (taskData.getApartment() != null) {
                    existingTask.setApartment(taskData.getApartment());
                }
                if (taskData.getDescription() != null) {
                    existingTask.setDescription(taskData.getDescription());
                }
                if (taskData.getStatus() != null) {
                    existingTask.setStatus(taskData.getStatus());
                }
                
                // Spara uppdaterade uppgiften
                PendingTask updatedTask = pendingTaskRepository.save(existingTask);
                log.info("Successfully updated pending task with ID: {}", updatedTask.getId());
                return ResponseEntity.ok(updatedTask);
            } else {
                log.warn("Pending task with ID {} not found for update", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            log.error("Error updating pending task with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to update pending task: " + e.getMessage(), e);
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<PendingTask> updatePendingTaskStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        
        log.info("PATCH /api/v1/pending-tasks/{}/status - Updating pending task status to {}", id, status);
        
        if (status == null || status.isEmpty()) {
            log.warn("Status value is missing in request body");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Optional<PendingTask> taskOptional = pendingTaskRepository.findById(id);
            
            if (taskOptional.isPresent()) {
                PendingTask task = taskOptional.get();
                task.setStatus(status);
                
                PendingTask updatedTask = pendingTaskRepository.save(task);
                log.info("Successfully updated status for pending task with ID: {}", updatedTask.getId());
                return ResponseEntity.ok(updatedTask);
            } else {
                log.warn("Pending task with ID {} not found for status update", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            log.error("Error updating status for pending task with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to update pending task status: " + e.getMessage(), e);
        }
    }
} 