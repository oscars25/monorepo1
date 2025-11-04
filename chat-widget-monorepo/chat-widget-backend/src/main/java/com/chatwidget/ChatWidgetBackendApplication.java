package com.chatwidget;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.boot.CommandLineRunner; 
import org.springframework.context.annotation.Bean; 
import org.springframework.security.crypto.password.PasswordEncoder; 

// Nuevas importaciones para forzar el escaneo de base de datos
import org.springframework.boot.autoconfigure.domain.EntityScan; // <-- IMPORTADA
import org.springframework.data.jpa.repository.config.EnableJpaRepositories; // <-- IMPORTADA

import com.chatwidget.repository.UserRepository; 
import com.chatwidget.entity.User; 

// AÑADIDAS ESTAS LÍNEAS 
@EntityScan(basePackages = "com.chatwidget.entity") 
@EnableJpaRepositories(basePackages = "com.chatwidget.repository")
// ----------------------------
@SpringBootApplication
@EnableAsync
public class ChatWidgetBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatWidgetBackendApplication.class, args);
    }

    // Método para inicializar el usuario 'admin' automáticamente
    @Bean
    public CommandLineRunner initUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Verifica si el usuario 'admin' ya existe en la base de datos
            if (userRepository.findByUsername("admin").isEmpty()) {
                
                // 2. Crea el objeto User con la contraseña hasheada
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123")); 
                admin.setEmail("admin@chat.com");
                admin.setRole(User.Role.ADMIN); 
                admin.setFullName("Docker Administrator");
                admin.setEnabled(true); 
                
                // 3. Guarda el usuario en la base de datos
                userRepository.save(admin);
                System.out.println("--- USUARIO 'admin' CREADO AUTOMÁTICAMENTE ---");
            }

            // Asegurar un usuario 'visitor' para asociar mensajes de visitantes anónimos
            if (userRepository.findByUsername("visitor").isEmpty()) {
                User visitor = new User();
                visitor.setUsername("visitor");
                visitor.setPassword(passwordEncoder.encode("visitor"));
                visitor.setEmail("visitor@chat.com");
                visitor.setRole(User.Role.AGENT); // rol neutro disponible
                visitor.setFullName("Visitante");
                visitor.setEnabled(true);
                userRepository.save(visitor);
                System.out.println("--- USUARIO 'visitor' CREADO AUTOMÁTICAMENTE ---");
            }
        };
    }
}