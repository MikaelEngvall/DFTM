package com.dftm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dftm.model.PendingTask;

@Repository
public interface PendingTaskRepository extends MongoRepository<PendingTask, String> {
    List<PendingTask> findByProcessed(boolean processed);
    List<PendingTask> findByActiveAndProcessed(boolean active, boolean processed);
    Optional<PendingTask> findByMessageId(String messageId);
} 