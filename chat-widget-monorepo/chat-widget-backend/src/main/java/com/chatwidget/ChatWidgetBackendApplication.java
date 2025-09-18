package com.chatwidget;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ChatWidgetBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatWidgetBackendApplication.class, args);
    }

}
