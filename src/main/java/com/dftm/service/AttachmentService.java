package com.dftm.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dftm.model.Attachment;
import com.dftm.repository.AttachmentRepository;
import com.dftm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttachmentService {
    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_TYPES = {
        "image/jpeg", "image/png", "application/pdf", 
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    public Attachment addAttachment(String taskId, MultipartFile file) {
        validateFile(file);
        
        taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        try {
            var attachment = Attachment.builder()
                    .taskId(taskId)
                    .fileName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .data(file.getBytes())
                    .size(file.getSize())
                    .build();
            
            return attachmentRepository.save(attachment);
        } catch (Exception e) {
            throw new RuntimeException("Could not store attachment", e);
        }
    }

    public List<Attachment> getAttachmentsByTaskId(String taskId) {
        return attachmentRepository.findByTaskId(taskId);
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit");
        }
        
        boolean validType = false;
        for (String type : ALLOWED_TYPES) {
            if (type.equals(file.getContentType())) {
                validType = true;
                break;
            }
        }
        
        if (!validType) {
            throw new RuntimeException("Invalid file type");
        }
    }
} 