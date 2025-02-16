package com.dftm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.dftm.model.Attachment;

public interface AttachmentRepository extends MongoRepository<Attachment, String> {
    List<Attachment> findByTaskId(String taskId);
} 