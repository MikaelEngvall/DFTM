package com.dftm.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import com.dftm.model.PendingTask;
import com.dftm.model.Language;
import com.dftm.repository.PendingTaskRepository;
import com.dftm.client.GoogleTranslateClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranslationQueueService {
    private final Queue<TranslationTask> translationQueue = new ConcurrentLinkedQueue<>();
    private final GoogleTranslateClient translateClient;
    private final PendingTaskRepository pendingTaskRepository;

    @Scheduled(fixedDelay = 5000) // Kör var 5:e sekund
    public void processTranslationQueue() {
        TranslationTask task = translationQueue.poll();
        if (task != null) {
            try {
                PendingTask pendingTask = task.getPendingTask();
                Language targetLanguage = task.getTargetLanguage();
                
                // Översätt titel
                if (!pendingTask.getTitleTranslations().containsKey(targetLanguage)) {
                    String translatedTitle = translateClient.translate(
                        pendingTask.getTitle(),
                        pendingTask.getOriginalLanguage().getCode(),
                        targetLanguage.getCode()
                    );
                    pendingTask.getTitleTranslations().put(targetLanguage, translatedTitle);
                }

                // Översätt beskrivning
                if (!pendingTask.getDescriptionTranslations().containsKey(targetLanguage)) {
                    String translatedDesc = translateClient.translate(
                        pendingTask.getDescription(),
                        pendingTask.getOriginalLanguage().getCode(),
                        targetLanguage.getCode()
                    );
                    pendingTask.getDescriptionTranslations().put(targetLanguage, translatedDesc);
                }

                pendingTaskRepository.save(pendingTask);
                log.info("\033[0;34m Translated task {} to {} \033[0m", 
                    pendingTask.getId(), targetLanguage);
            } catch (Exception e) {
                log.error("\033[0;31m Translation failed: {} \033[0m", e.getMessage());
                // Lägg tillbaka i kön för att försöka igen senare
                translationQueue.offer(task);
            }
        }
    }

    public void queueTranslation(PendingTask task, Language targetLanguage) {
        translationQueue.offer(new TranslationTask(task, targetLanguage));
        log.info("\033[0;34m Queued translation for task {} to {} \033[0m", 
            task.getId(), targetLanguage);
    }

    @Data
    @AllArgsConstructor
    private static class TranslationTask {
        private PendingTask pendingTask;
        private Language targetLanguage;
    }
} 