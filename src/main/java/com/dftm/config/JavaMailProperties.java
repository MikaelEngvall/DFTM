package com.dftm.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "mail")
@Data
public class JavaMailProperties {
    private String host;
    private int port;
    private String username;
    private String password;
} 