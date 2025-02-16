package com.dftm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dftm.model.Task;
import com.dftm.model.TaskStatus;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByAssignee(String assignee);
    List<Task> findByAssigner(String assigner);
    List<Task> findByStatus(TaskStatus status);
} 