package com.dftm.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dftm.dto.TaskRequest;
import com.dftm.exception.ResourceNotFoundException;
import com.dftm.model.Language;
import com.dftm.model.Task;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;
import com.dftm.model.Translation;
import com.dftm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {
    private final TaskRepository taskRepository;
    private final TranslationService translationService;

    public Task createTask(Task task) {
        log.debug("Creating new task");
        log.debug("Input task approved = {}", task.isApproved());
        
        // Skapa översättningar för titel och beskrivning
        Translation titleTranslation = translationService.createTranslation(
            task.getTitle(), 
            task.getOriginalLanguage()
        );
        Translation descriptionTranslation = translationService.createTranslation(
            task.getDescription(), 
            task.getOriginalLanguage()
        );
        
        // Spara referenserna till översättningarna
        task.setTitleTranslationId(titleTranslation.getId());
        task.setDescriptionTranslationId(descriptionTranslation.getId());
        
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        task.setArchived(false);
        task.setApproved(true);  // Sätt alltid approved till true för nya uppgifter
        log.debug("Before save approved = {}", task.isApproved());
        
        Task savedTask = taskRepository.save(task);
        log.debug("After save approved = {}", savedTask.isApproved());
        return savedTask;
    }

    public Task getTask(String id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public List<Task> getAllTasks() {
        log.debug("Fetching all tasks");
        return taskRepository.findAll();
    }

    public Task getTaskById(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public Task updateTask(String taskId, TaskRequest request) {
        Task existingTask = getTaskById(taskId);
        existingTask.setTitle(request.getTitle());
        existingTask.setDescription(request.getDescription());
        existingTask.setStatus(request.getStatus());
        existingTask.setPriority(request.getPriority());
        existingTask.setDueDate(request.getDueDate());
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

    public Task archiveTask(String taskId) {
        Task task = getTaskById(taskId);
        task.setArchived(true);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Task approveTask(String taskId) {
        log.debug("Approving task with ID: {}", taskId);
        Task task = getTaskById(taskId);
        task.setApproved(true);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Task updateTaskPriority(String taskId, TaskPriority priority) {
        Task task = getTaskById(taskId);
        task.setPriority(priority);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public boolean isAssignedToUser(String taskId, String userId) {
        Task task = getTaskById(taskId);
        return task.getAssignedTo() != null && task.getAssignedTo().equals(userId);
    }

    // Ny metod för att hämta översatt uppgift
    public Task getTranslatedTask(String taskId, Language targetLanguage) {
        log.debug("Fetching task with id: {} and translating to language: {}", taskId, targetLanguage);
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        
        if (targetLanguage == null || targetLanguage == task.getOriginalLanguage()) {
            return task;
        }
        
        // Hämta översättningar
        String translatedTitle = translationService.getTranslatedText(
            task.getTitleTranslationId(), 
            targetLanguage
        );
        String translatedDescription = translationService.getTranslatedText(
            task.getDescriptionTranslationId(), 
            targetLanguage
        );
        
        // Skapa en kopia av uppgiften med översatta texter
        Task translatedTask = new Task();
        translatedTask.setId(task.getId());
        translatedTask.setTitle(translatedTitle);
        translatedTask.setDescription(translatedDescription);
        translatedTask.setStatus(task.getStatus());
        translatedTask.setPriority(task.getPriority());
        translatedTask.setAssignedTo(task.getAssignedTo());
        translatedTask.setAssigner(task.getAssigner());
        translatedTask.setReporter(task.getReporter());
        translatedTask.setDueDate(task.getDueDate());
        translatedTask.setCreatedAt(task.getCreatedAt());
        translatedTask.setUpdatedAt(task.getUpdatedAt());
        translatedTask.setComments(task.getComments());
        translatedTask.setArchived(task.isArchived());
        translatedTask.setApproved(task.isApproved());
        
        return translatedTask;
    }

    public List<Task> getNonArchivedTasks() {
        log.debug("Fetching non-archived tasks");
        return taskRepository.findByArchived(false);
    }

    public Task updateTaskStatus(String taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public Task unarchiveTask(String taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setArchived(false);
        return taskRepository.save(task);
    }

    public List<Task> getTasksByAssignedToAndArchived(String userId, Boolean archived) {
        return taskRepository.findByArchivedAndAssignedTo(archived, userId);
    }
} 