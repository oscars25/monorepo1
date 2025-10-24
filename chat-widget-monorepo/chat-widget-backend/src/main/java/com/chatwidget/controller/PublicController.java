package com.chatwidget.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {

    @GetMapping("/")
    public String root() {
        return "✅ Chat Widget Backend corriendo correctamente";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}