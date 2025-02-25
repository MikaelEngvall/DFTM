package com.dftm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dftm.model.Task;
import com.dftm.model.TaskStatus;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByAssignedTo(String assignedTo);
    List<Task> findByAssigner(String assigner);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByArchived(Boolean archived);
    List<Task> findByArchivedAndAssignedTo(Boolean archived, String assignedTo);
} 