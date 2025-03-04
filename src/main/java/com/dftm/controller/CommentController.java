package com.dftm.controller;

import java.util.List;
import java.util.Map;

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

    /**
     * Lägger till en kommentar för en specifik uppgift
     * 
     * @param taskId ID för uppgiften som kommentaren gäller
     * @param requestPayload Map som innehåller texten för kommentaren
     * @return Den skapade kommentaren
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public Comment addComment(@PathVariable String taskId, @RequestBody Map<String, String> requestPayload) {
        String commentText = requestPayload.get("text");
        if (commentText == null || commentText.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }
        
        return commentService.addComment(taskId, commentText);
    }
    
    /**
     * Hämtar alla kommentarer för en specifik uppgift
     * 
     * @param taskId ID för uppgiften
     * @param language Språket som kommentarerna ska översättas till
     * @return Lista med kommentarer
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public List<Comment> getComments(
            @PathVariable String taskId,
            @RequestParam(required = false, defaultValue = "SV") String language) {
        
        Language lang;
        try {
            lang = Language.valueOf(language);
        } catch (IllegalArgumentException e) {
            lang = Language.SV; // Default till svenska om ogiltig språkkod
        }
        
        return commentService.getTranslatedComments(taskId, lang);
    }
} 