package com.dftm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.dftm.model.Comment;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByTaskId(String taskId);
} 