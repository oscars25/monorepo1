package com.chatwidget.controller;

import com.chatwidget.entity.User;
import com.chatwidget.security.JwtService;
import com.chatwidget.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> getUserById(
            @PathVariable Long id,
            Authentication authentication) {

        // Verificar si el usuario solicitado es el mismo que el autenticado o es admin
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!currentUser.getId().equals(id) && currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        return userService.getUserById(id)
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("username", user.getUsername());
                    response.put("email", user.getEmail());
                    response.put("role", user.getRole());
                    response.put("fullName", user.getFullName());
                    response.put("enabled", user.isEnabled());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestBody CreateUserRequest request) {

        User user = userService.createUser(
                request.getUsername(),
                request.getPassword(),
                request.getEmail(),
                request.getRole(),
                request.getFullName()
        );

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "fullName", user.getFullName()
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<Map<String, ?>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request,
            Authentication authentication) {

        // Verificar si el usuario autenticado tiene permiso para actualizar
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!currentUser.getId().equals(id) && currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        User user = userService.updateUser(
                id,
                request.getUsername(),
                request.getEmail(),
                request.getRole(),
                request.getFullName()
        );

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "fullName", user.getFullName()
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable User.Role role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    public static class CreateUserRequest {
        private String username;
        private String password;
        private String email;
        private User.Role role;
        private String fullName;

        // Getters y setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public User.Role getRole() { return role; }
        public void setRole(User.Role role) { this.role = role; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public static class UpdateUserRequest {
        private String username;
        private String email;
        private User.Role role;
        private String fullName;

        // Getters y setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public User.Role getRole() { return role; }
        public void setRole(User.Role role) { this.role = role; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }
}
