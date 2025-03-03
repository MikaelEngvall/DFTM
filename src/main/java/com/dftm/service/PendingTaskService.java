package com.dftm.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dftm.model.PendingTask;
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
                log.info("First task details - ID: {}, Address: {}, Status: {}", 
                        firstTask.getId(), firstTask.getAddress(), firstTask.getStatus());
            }
            return pendingTasks;
        } catch (Exception e) {
            log.error("Error while fetching pending tasks: {}", e.getMessage(), e);
            return List.of(); // Returnera en tom lista vid fel
        }
    }

    public List<PendingTask> getPendingTasksByStatus(String status) {
        log.debug("Fetching pending tasks with status={}", status);
        return pendingTaskRepository.findByStatus(status);
    }

    public List<PendingTask> getPendingTasksByAddress(String address) {
        log.debug("Fetching pending tasks with address containing={}", address);
        return pendingTaskRepository.findByAddressContaining(address);
    }

    public PendingTask approvePendingTask(String pendingTaskId) {
        PendingTask pendingTask = pendingTaskRepository.findById(pendingTaskId)
                .orElseThrow(() -> new RuntimeException("Pending task not found"));

        // Markera pending task som godkänd
        pendingTask.setStatus("APPROVED");
        return pendingTaskRepository.save(pendingTask);
    }
    
    /**
     * Godkänner en väntande uppgift och uppdaterar tilldelningsinformation.
     * 
     * @param pendingTaskId ID för uppgiften som ska godkännas
     * @param assignedToUserId ID för användaren som uppgiften tilldelas
     * @param assignedByUserId ID för användaren som gör tilldelningen
     * @param dueDate Förfallodatum för uppgiften (ISO-8601 format)
     * @return Den uppdaterade väntande uppgiften
     */
    public PendingTask approvePendingTask(String pendingTaskId, String assignedToUserId, String assignedByUserId, String dueDate) {
        PendingTask pendingTask = pendingTaskRepository.findById(pendingTaskId)
                .orElseThrow(() -> new RuntimeException("Pending task not found"));

        // Markera pending task som godkänd
        pendingTask.setStatus("APPROVED");
        
        // Uppdatera tilldelningsinformation om den angetts
        if (assignedToUserId != null && !assignedToUserId.isEmpty()) {
            pendingTask.setAssignedToUserId(assignedToUserId);
        }
        
        if (assignedByUserId != null && !assignedByUserId.isEmpty()) {
            pendingTask.setAssignedByUserId(assignedByUserId);
        }
        
        return pendingTaskRepository.save(pendingTask);
    }
    
    public PendingTask rejectPendingTask(String pendingTaskId) {
        PendingTask pendingTask = pendingTaskRepository.findById(pendingTaskId)
                .orElseThrow(() -> new RuntimeException("Pending task not found"));

        // Markera pending task som avslagen
        pendingTask.setStatus("REJECTED");
        return pendingTaskRepository.save(pendingTask);
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