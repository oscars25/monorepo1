package com.chatwidget.config;

import com.chatwidget.entity.User;
import com.chatwidget.repository.UserRepository;
import com.chatwidget.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthService authService;

    public DataInitializer(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Verificar si el usuario admin ya existe
        if (!userRepository.findByUsername("admin").isPresent()) {
            System.out.println("Creando usuario admin...");

            // Crear usuario admin con contraseña admin123
            authService.createUser(
                "admin", 
                "admin123", 
                "admin@example.com", 
                User.Role.ADMIN, 
                "Administrador del Sistema"
            );

            System.out.println("Usuario admin creado exitosamente");
        } else {
            System.out.println("El usuario admin ya existe");
        }
    }
}
