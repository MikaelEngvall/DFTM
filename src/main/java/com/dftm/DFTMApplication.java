package com.dftm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.dftm.model.Task;
import com.dftm.model.Translation;
import com.dftm.model.Comment;
import com.dftm.service.TranslationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@SpringBootApplication
@EnableScheduling
@Slf4j
@RequiredArgsConstructor
public class DFTMApplication {
    public static void main(String[] args) {
        SpringApplication.run(DFTMApplication.class, args);
    }

    @Bean
    public CommandLineRunner migrateTaskStatuses(MongoTemplate mongoTemplate) {
        return args -> {
            log.info("Starting task migration...");

            // Uppdatera status
            Query query = new Query(Criteria.where("status").is("pending"));
            Update update = new Update().set("status", "PENDING");
            long pendingCount = mongoTemplate.updateMulti(query, update, Task.class).getModifiedCount();
            log.info("Updated {} pending tasks", pendingCount);

            // Uppdatera null priority
            query = new Query(Criteria.where("priority").is(null));
            update = new Update().set("priority", "MEDIUM");
            long priorityCount = mongoTemplate.updateMulti(query, update, Task.class).getModifiedCount();
            log.info("Updated {} tasks with null priority", priorityCount);

            // Lägg till assigner-fält för alla existerande tasks
            query = new Query(Criteria.where("assigner").exists(false));
            update = new Update().set("assigner", null);
            long assignerCount = mongoTemplate.updateMulti(query, update, Task.class).getModifiedCount();
            log.info("Added assigner field to {} tasks", assignerCount);

            log.info("Task migration completed. Total fields updated: {}", 
                pendingCount + priorityCount + assignerCount);
        };
    }

    @Bean
    public CommandLineRunner migrateTranslations(
            MongoTemplate mongoTemplate,
            TranslationService translationService) {
        return args -> {
            log.info("Starting translation migration...");

            // Hitta alla tasks som inte har översättningar
            Query query = new Query(Criteria.where("descriptionTranslationId").exists(false));
            List<Task> tasks = mongoTemplate.find(query, Task.class);
            
            for (Task task : tasks) {
                // Skapa översättning för beskrivning
                if (task.getDescription() != null) {
                    Translation translation = translationService.translateAndSave(task.getDescription());
                    if (translation != null) {
                        task.setDescriptionTranslationId(translation.getId());
                        mongoTemplate.save(task);
                        log.info("Created translation for task: {}", task.getId());
                    }
                }

                // Skapa översättningar för kommentarer
                if (task.getComments() != null) {
                    for (Comment comment : task.getComments()) {
                        if (comment.getTranslationId() == null && comment.getText() != null) {
                            Translation translation = translationService.translateAndSave(comment.getText());
                            if (translation != null) {
                                comment.setTranslationId(translation.getId());
                                log.info("Created translation for comment in task: {}", task.getId());
                            }
                        }
                    }
                    mongoTemplate.save(task);
                }
            }

            log.info("Translation migration completed. Processed {} tasks", tasks.size());
        };
    }
} 