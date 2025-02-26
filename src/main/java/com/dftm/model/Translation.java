package com.dftm.model;

import java.util.Map;
import java.util.HashMap;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "translations")
public class Translation {
    @Id
    private String id;
    private String originalText;
    private Language originalLanguage;
    @Builder.Default
    private Map<Language, String> translations = new HashMap<>();
    @Builder.Default
    private boolean active = true;
} 