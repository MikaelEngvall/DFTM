package com.dftm.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.model.PendingTask;
import com.dftm.service.PendingTaskService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/pending-tasks")
@RequiredArgsConstructor
@Slf4j
public class PendingTaskController {
    private final PendingTaskService pendingTaskService;

    @GetMapping
    public ResponseEntity<List<PendingTask>> getAllPendingTasks(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean processed) {
        log.debug("Fetching pending tasks with filters - active: {}, processed: {}", active, processed);
        
        if (active != null && processed != null) {
            return ResponseEntity.ok(pendingTaskService.getPendingTasksByActiveAndProcessed(active, processed));
        } else if (active != null) {
            return ResponseEntity.ok(pendingTaskService.getPendingTasksByActive(active));
        } else if (processed != null) {
            return ResponseEntity.ok(pendingTaskService.getPendingTasksByProcessed(processed));
        } else {
            // Inga filter angivna, returnera alla
            return ResponseEntity.ok(pendingTaskService.getAllPendingTasks());
        }
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
} 