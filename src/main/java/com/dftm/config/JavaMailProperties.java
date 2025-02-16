package com.dftm.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "spring.mail")
public class JavaMailProperties {
    private String host;
    private int port;
    private String username;
    private String password;
} 