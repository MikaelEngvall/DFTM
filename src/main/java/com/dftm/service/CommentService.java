package com.dftm.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dftm.model.Comment;
import com.dftm.repository.CommentRepository;
import com.dftm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final EmailService emailService;

    public Comment addComment(String taskId, Comment comment) {
        var task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        comment.setTaskId(taskId);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        
        var savedComment = commentRepository.save(comment);
        
        // Notify assignee
        if (task.getAssignee() != null) {
            emailService.sendTaskNotification(
                task.getAssignee(),
                "New comment on task: " + task.getTitle(),
                "A new comment has been added to task: " + task.getTitle()
            );
        }
        
        return savedComment;
    }

    public List<Comment> getCommentsByTaskId(String taskId) {
        return commentRepository.findByTaskId(taskId);
    }
} 