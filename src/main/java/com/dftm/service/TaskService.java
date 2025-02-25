package com.dftm.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.dftm.exception.UnauthorizedAccessException;
import com.dftm.model.Task;
import com.dftm.model.User;
import com.dftm.model.TaskStatus;
import com.dftm.model.Role;
import com.dftm.repository.TaskRepository;
import com.dftm.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {
    private final TaskRepository taskRepository;

    public Task createTask(Task task) {
        log.debug("Creating new task");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        task.setArchived(false);
        return taskRepository.save(task);
    }

    public Task getTask(String id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public List<Task> getAllTasks(Boolean archived, String assignedTo) {
        log.debug("Fetching tasks with filters - archived: {}, assignedTo: {}", archived, assignedTo);
        
        if (archived != null && assignedTo != null) {
            return taskRepository.findByArchivedAndAssignedTo(archived, assignedTo);
        } else if (archived != null) {
            return taskRepository.findByArchived(archived);
        } else if (assignedTo != null) {
            return taskRepository.findByAssignedTo(assignedTo);
        }
        
        return taskRepository.findAll();
    }

    public Task getTaskById(String taskId) {
        log.debug("Fetching task with ID: {}", taskId);
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public Task updateTask(String taskId, Task updatedTask) {
        log.debug("Updating task with ID: {}", taskId);
        
        Task existingTask = getTaskById(taskId);
        
        // Kontrollera om användaren har behörighet att uppdatera uppgiften
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        
        if (!hasPermissionToEdit(currentUser, existingTask)) {
            throw new UnauthorizedAccessException("You do not have permission to edit this task");
        }

        // Uppdatera fält
        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setAssignedTo(updatedTask.getAssignedTo());
        existingTask.setUpdatedAt(LocalDateTime.now());
        
        return taskRepository.save(existingTask);
    }

    public void deleteTask(String id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    public Task assignTask(String id, String assignedTo, String assigner) {
        Task task = getTask(id);
        task.setAssignedTo(assignedTo);
        task.setAssigner(assigner != null ? assigner : "admin@dftm.com"); // Default assigner
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public List<Task> getTasksByAssignedTo(String assignedTo) {
        return taskRepository.findByAssignedTo(assignedTo);
    }

    public List<Task> getTasksByAssigner(String assigner) {
        return taskRepository.findByAssigner(assigner);
    }

    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    public void archiveTask(String taskId) {
        log.debug("Archiving task with ID: {}", taskId);
        Task task = getTaskById(taskId);
        task.setArchived(true);
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);
    }

    public Task approveTask(String taskId) {
        log.debug("Approving task with ID: {}", taskId);
        Task task = getTaskById(taskId);
        task.setApproved(true);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public boolean isAssignedToUser(String taskId, String userId) {
        Task task = getTaskById(taskId);
        return task.getAssignedTo() != null && task.getAssignedTo().equals(userId);
    }

    private boolean hasPermissionToEdit(User user, Task task) {
        // ADMIN och SUPERADMIN kan redigera alla uppgifter
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPERADMIN) {
            return true;
        }
        
        // Användare kan bara redigera uppgifter som är tilldelade till dem
        return task.getAssignedTo() != null && task.getAssignedTo().equals(user.getId());
    }
} 