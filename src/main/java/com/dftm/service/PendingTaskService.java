package com.dftm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dftm.model.PendingTask;
import com.dftm.model.Task;
import com.dftm.model.TaskPriority;
import com.dftm.model.TaskStatus;
import com.dftm.model.Language;
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
        
        // Skapa en Task från den godkända PendingTask
        createTaskFromPendingTask(pendingTask);
        
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
        log.info("Approving pending task with ID: {}, assignedToUserId: {}, assignedByUserId: {}, dueDate: {}", pendingTaskId, assignedToUserId, assignedByUserId, dueDate);
        
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
        
        // Skapa en Task från den godkända PendingTask
        Task createdTask = createTaskFromPendingTask(pendingTask, dueDate);
        log.info("Created new task from pending task: {}", createdTask.getId());
        
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
    
    /**
     * Skapar en Task från en godkänd PendingTask.
     * 
     * @param pendingTask Den godkända PendingTask som ska konverteras
     * @return Den skapade Task
     */
    private Task createTaskFromPendingTask(PendingTask pendingTask) {
        return createTaskFromPendingTask(pendingTask, null);
    }
    
    /**
     * Skapar en Task från en godkänd PendingTask med angivet förfallodatum.
     * 
     * @param pendingTask Den godkända PendingTask som ska konverteras
     * @param dueDateStr Förfallodatum för uppgiften (ISO-8601 format)
     * @return Den skapade Task
     */
    private Task createTaskFromPendingTask(PendingTask pendingTask, String dueDateStr) {
        log.info("Creating task from pending task with ID: {}", pendingTask.getId());
        
        // Skapa en titel från pendingTask
        String title = generateTitleFromPendingTask(pendingTask);
        
        // Bestäm prioritet baserat på innehållet eller sätt standardprioritet
        TaskPriority priority = determineTaskPriority(pendingTask);
        
        // Skapa ett dueDate från det angivna datumet eller 7 dagar från nu
        LocalDateTime dueDate = dueDateStr != null && !dueDateStr.isEmpty() 
            ? LocalDateTime.parse(dueDateStr.replace("Z", "")) 
            : LocalDateTime.now().plusDays(7);
        
        // Skapa Task-objektet
        Task task = Task.builder()
                .title(title)
                .description(pendingTask.getDescription())
                .status(TaskStatus.PENDING)
                .priority(priority)
                .assignedTo(pendingTask.getAssignedToUserId())
                .assigner(pendingTask.getAssignedByUserId())
                .dueDate(dueDate)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .archived(false)
                .approved(true)
                .originalLanguage(pendingTask.getDescriptionLanguage() != null ? pendingTask.getDescriptionLanguage() : Language.SV)
                .build();
        
        // Om det finns översättningar, kopiera dem
        if (pendingTask.getDescriptionTranslations() != null && !pendingTask.getDescriptionTranslations().isEmpty()) {
            task.setDescriptionTranslations(pendingTask.getDescriptionTranslations());
        }
        
        // Spara och returnera den nya uppgiften
        return taskRepository.save(task);
    }
    
    /**
     * Genererar en titel baserad på information i PendingTask.
     * 
     * @param pendingTask PendingTask som titeln ska genereras från
     * @return Genererad titel
     */
    private String generateTitleFromPendingTask(PendingTask pendingTask) {
        // Skapa en beskrivande titel baserad på adress, namn, etc.
        StringBuilder titleBuilder = new StringBuilder();
        
        if (pendingTask.getAddress() != null && !pendingTask.getAddress().isEmpty()) {
            titleBuilder.append(pendingTask.getAddress());
            
            if (pendingTask.getApartment() != null && !pendingTask.getApartment().isEmpty()) {
                titleBuilder.append(", ").append(pendingTask.getApartment());
            }
        }
        
        if (pendingTask.getName() != null && !pendingTask.getName().isEmpty()) {
            if (titleBuilder.length() > 0) {
                titleBuilder.append(" - ");
            }
            titleBuilder.append(pendingTask.getName());
        }
        
        // Om vi inte har någon information, använd en generisk titel
        if (titleBuilder.length() == 0) {
            titleBuilder.append("Felanmälan ");
            titleBuilder.append(pendingTask.getId().substring(0, 8));
        }
        
        return titleBuilder.toString();
    }
    
    /**
     * Bestämmer prioritet baserat på innehållet i PendingTask.
     * 
     * @param pendingTask PendingTask som prioritet ska bestämmas för
     * @return Lämplig TaskPriority
     */
    private TaskPriority determineTaskPriority(PendingTask pendingTask) {
        // Som standard, använd MEDIUM prioritet
        return TaskPriority.MEDIUM;
    }
} 