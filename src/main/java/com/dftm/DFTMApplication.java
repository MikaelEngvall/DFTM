package com.dftm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@EnableScheduling
@Slf4j
@RequiredArgsConstructor
public class DFTMApplication {
    public static void main(String[] args) {
        SpringApplication.run(DFTMApplication.class, args);
    }
} 