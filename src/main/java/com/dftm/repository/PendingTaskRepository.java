package com.dftm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dftm.model.PendingTask;

@Repository
public interface PendingTaskRepository extends MongoRepository<PendingTask, String> {
    List<PendingTask> findByStatus(String status);
    List<PendingTask> findByEmailContaining(String email);
    List<PendingTask> findByAddressContaining(String address);
} 