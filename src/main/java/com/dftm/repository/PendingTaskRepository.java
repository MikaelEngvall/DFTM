package com.dftm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dftm.model.PendingTask;

@Repository
public interface PendingTaskRepository extends MongoRepository<PendingTask, String> {
    List<PendingTask> findByApproved(boolean approved);
    List<PendingTask> findByAssigned(boolean assigned);
    List<PendingTask> findByAssignedAndApproved(boolean assigned, boolean approved);
    Optional<PendingTask> findByMessageId(String messageId);
} 