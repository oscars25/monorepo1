package com.chatwidget.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.init.create-admin:true}")
    private boolean createAdmin;

    @Value("${app.init.admin.username:admin}")
    private String adminUsername;

    @Value("${app.init.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.init.admin.email:admin@example.com}")
    private String adminEmail;

    public DataInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!createAdmin) {
            log.info("Creación de admin deshabilitada por app.init.create-admin=false");
            return;
        }

        try {
            Boolean usersTableExists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users')",
                Boolean.class);

            if (usersTableExists == null || !usersTableExists) {
                log.warn("Tabla 'users' no existe todavía — se omite la inserción del admin.");
                return;
            }

            Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM users WHERE username = ?",
                Integer.class, adminUsername);

            if (count != null && count > 0) {
                log.info("Usuario '{}' ya existe, no se crea.", adminUsername);
                return;
            }

            String hashed = passwordEncoder.encode(adminPassword);
            jdbcTemplate.update(
                "INSERT INTO users (username, password, email, role, full_name, is_enabled) VALUES (?, ?, ?, ?, ?, ?)",
                adminUsername, hashed, adminEmail, "ADMIN", "Administrador del Sistema", true);

            log.info("Usuario admin creado: {}", adminUsername);

        } catch (Exception ex) {
            log.error("Error inicializando datos: {}", ex.getMessage());
        }
    }
}
