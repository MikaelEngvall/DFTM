package com.dftm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dftm.model.Comment;
import com.dftm.model.Language;
import com.dftm.service.CommentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/tasks/{taskId}/comments")
@RequiredArgsConstructor
@Slf4j
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<Comment> addComment(
            @PathVariable String taskId,
            @RequestBody Map<String, String> payload
    ) {
        try {
            // Extrahera text från payload
            String text = payload.get("text");
            if (text == null || text.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Skapa en ny kommentar
            Comment comment = Comment.createNew(taskId, text, null); // userId sätts i service
            
            Comment savedComment = commentService.addComment(taskId, comment);
            return ResponseEntity.ok(savedComment);
        } catch (Exception e) {
            log.error("Error adding comment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<Comment>> getComments(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "EN") Language language
    ) {
        return ResponseEntity.ok(commentService.getTranslatedComments(taskId, language));
    }
} 