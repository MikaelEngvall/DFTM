package com.dftm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.dftm.model.Comment;
import com.dftm.model.Language;
import com.dftm.model.Translation;
import com.dftm.repository.CommentRepository;
import com.dftm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final EmailService emailService;
    private final TranslationService translationService;

    public Comment addComment(String taskId, Comment comment) {
        var task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        comment.setTaskId(taskId);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        
        // Skapa översättning för kommentartexten
        Translation textTranslation = translationService.createTranslation(
            comment.getText(), 
            comment.getOriginalLanguage()
        );
        comment.setTextTranslationId(textTranslation.getId());
        
        var savedComment = commentRepository.save(comment);
        
        // Notify assignee
        if (task.getAssignedTo() != null) {
            emailService.sendTaskNotification(
                task.getAssignedTo(),
                "New comment on task: " + task.getTitle(),
                "A new comment has been added to task: " + task.getTitle()
            );
        }
        
        return savedComment;
    }

    public List<Comment> getCommentsByTaskId(String taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    public List<Comment> getTranslatedComments(String taskId, Language language) {
        List<Comment> comments = getCommentsByTaskId(taskId);
        
        return comments.stream()
            .map(comment -> translateComment(comment, language))
            .collect(Collectors.toList());
    }

    private Comment translateComment(Comment comment, Language language) {
        // Om språket är samma som originalspråket, returnera kommentaren som den är
        if (language == comment.getOriginalLanguage()) {
            return comment;
        }
        
        // Hämta översättning
        String translatedText = translationService.getTranslatedText(
            comment.getTextTranslationId(), 
            language
        );
        
        // Skapa en kopia av kommentaren med översatt text
        Comment translatedComment = new Comment();
        translatedComment.setId(comment.getId());
        translatedComment.setTaskId(comment.getTaskId());
        translatedComment.setText(translatedText);
        translatedComment.setTextTranslationId(comment.getTextTranslationId());
        translatedComment.setUserId(comment.getUserId());
        translatedComment.setCreatedAt(comment.getCreatedAt());
        translatedComment.setUpdatedAt(comment.getUpdatedAt());
        
        return translatedComment;
    }
} 