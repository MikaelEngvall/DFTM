package com.dftm.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dftm.model.Comment;
import com.dftm.model.Language;
import com.dftm.model.Task;
import com.dftm.model.Translation;
import com.dftm.model.User;
import com.dftm.repository.CommentRepository;
import com.dftm.repository.TaskRepository;
import com.dftm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TranslationService translationService;
    private final UserService userService;
    private final EmailService emailService;

    public Comment addComment(String taskId, String text) {
        User currentUser = userService.getCurrentUser();
        
        if (currentUser == null) {
            throw new IllegalStateException("Användare måste vara inloggad för att lägga till kommentar");
        }
        
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        
        if (taskOpt.isEmpty()) {
            throw new IllegalArgumentException("Uppgift med id " + taskId + " hittades inte");
        }
        
        // Skapa en ny kommentar
        Comment comment = Comment.createNew(
            taskId, 
            text, 
            currentUser.getId(), 
            currentUser.getFirstName() + " " + currentUser.getLastName()
        );
        
        // Detektera språk (kommentaren behåller originalspråket)
        Language detectedLanguage = Language.SV; // Standardvärde
        
        // Översätt kommentaren till alla språk och spara översättningarna
        Translation translation = translationService.translateAndSave(text, detectedLanguage);
        
        // Koppla översättningens ID till kommentaren
        comment.setTextTranslationId(translation.getId());
        comment.setOriginalLanguage(detectedLanguage);
        
        // Spara kommentaren
        Comment savedComment = commentRepository.save(comment);
        
        // Skicka e-postnotifikation till uppgiftens ansvarige om det inte är samma person
        Task task = taskOpt.get();
        if (task.getAssignedTo() != null && !task.getAssignedTo().equals(currentUser.getId())) {
            Optional<User> assigneeOpt = userRepository.findById(task.getAssignedTo());
            if (assigneeOpt.isPresent()) {
                User assignee = assigneeOpt.get();
                emailService.sendCommentNotification(assignee.getEmail(), task.getTitle(), comment.getText());
            }
        }
        
        return savedComment;
    }

    public List<Comment> getCommentsByTaskId(String taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    public List<Comment> getTranslatedComments(String taskId, Language language) {
        List<Comment> comments = getCommentsByTaskId(taskId);
        List<Comment> translatedComments = new ArrayList<>();
        
        for (Comment comment : comments) {
            // Skapa en kopia av kommentaren för att inte ändra originalet i databasen
            Comment translatedComment = new Comment();
            // Kopiera alla fält från originalkommentaren
            translatedComment.setId(comment.getId());
            translatedComment.setTaskId(comment.getTaskId());
            translatedComment.setUserId(comment.getUserId());
            translatedComment.setUserName(comment.getUserName());
            translatedComment.setCreatedAt(comment.getCreatedAt());
            translatedComment.setUpdatedAt(comment.getUpdatedAt());
            translatedComment.setOriginalLanguage(comment.getOriginalLanguage());
            
            // Hämta översättningen om det finns en koppling till Translation
            if (comment.getTextTranslationId() != null && !comment.getTextTranslationId().isEmpty()) {
                // Använd TranslationService för att hämta översättningen
                String translatedText = translationService.getTranslatedText(
                    comment.getTextTranslationId(), language);
                translatedComment.setText(translatedText);
            } else {
                // Om ingen översättning finns, använd originaltext
                translatedComment.setText(comment.getText());
            }
            
            translatedComments.add(translatedComment);
        }
        
        return translatedComments;
    }
} 