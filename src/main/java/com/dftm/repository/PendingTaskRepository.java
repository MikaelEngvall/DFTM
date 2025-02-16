package com.dftm.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.dftm.model.PendingTask;

@Repository
public interface PendingTaskRepository extends MongoRepository<PendingTask, String> {
} 