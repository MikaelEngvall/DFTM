package com.dftm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.dftm.model.Task;
import com.dftm.model.TaskStatus;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByAssignedTo(String assignedTo);
    List<Task> findByAssigner(String assigner);
    @Query("{ 'status' : ?0 }")
    List<Task> findByStatus(TaskStatus status);
<<<<<<< HEAD
    List<Task> findByArchived(Boolean archived);
    List<Task> findByArchivedAndAssignedTo(Boolean archived, String assignedTo);
=======
    @Query("{ }")
    List<Task> findAllTasks();
>>>>>>> da99129625826e73133cdac6490346b8c8af8627
} 