package com.chatwidget.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import com.chatwidget.service.AuthService;
import com.chatwidget.security.JwtService;
import com.chatwidget.entity.User;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final AuthService authService;

    public AuthController(AuthenticationManager authManager, JwtService jwtService, AuthService authService) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @PostMapping("/login-test")
    public ResponseEntity<?> loginTest(@Valid @RequestBody LoginRequest request) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            return ResponseEntity.ok(new LoginResponse(true, "Authenticated"));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid credentials"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = authService.getUserByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado después de autenticar"));

            // Incluir claims útiles para el frontend
            Map<String, Object> extraClaims = Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole().name(),
                    "fullName", user.getFullName()
            );

            String token = jwtService.generateToken(user, extraClaims);

            return ResponseEntity.ok(new AuthResponse(token, new UserDto(user)));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid credentials"));
        }
    }

    public static class AuthResponse {
        public String token;
        public UserDto user;
        public AuthResponse(String token, UserDto user) {
            this.token = token;
            this.user = user;
        }
    }

    public static class UserDto {
        public Long id;
        public String username;
        public String email;
        public String role;
        public String fullName;
        public UserDto(User u) {
            this.id = u.getId();
            this.username = u.getUsername();
            this.email = u.getEmail();
            this.role = u.getRole() != null ? u.getRole().name() : null;
            this.fullName = u.getFullName();
        }
    }

    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;

        // Getters necesarios por compilador / frameworks
        public String getUsername() {
            return username;
        }
        public String getPassword() {
            return password;
        }

        // Setters (Jackson los usa al deserializar JSON)
        public void setUsername(String username) {
            this.username = username;
        }
        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginResponse {
        public boolean authenticated;
        public String message;
        public LoginResponse(boolean authenticated, String message) {
            this.authenticated = authenticated;
            this.message = message;
        }
    }
}
