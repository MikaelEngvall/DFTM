package com.dftm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dftm.model.Task;
import com.dftm.model.TaskStatus;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByArchived(boolean archived);
    List<Task> findByAssignedTo(String assignedTo);
    List<Task> findByAssigner(String assigner);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByArchivedAndAssignedTo(boolean archived, String assignedTo);
} 