package com.dftm.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;
import java.util.HashMap;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "translations")
public class Translation {
    @Id
    private String id;
    private String originalText;
    private Map<Language, String> translations = new HashMap<>();
} 