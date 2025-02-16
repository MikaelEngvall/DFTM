package com.dftm.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.dftm.model.Translation;

@Repository
public interface TranslationRepository extends MongoRepository<Translation, String> {
} 