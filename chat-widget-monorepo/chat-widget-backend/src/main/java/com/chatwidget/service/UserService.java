package com.chatwidget.service;

import com.chatwidget.entity.User;
import com.chatwidget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(String username, String password, String email, User.Role role, String fullName) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("El nombre de usuario ya existe");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("El email ya está en uso");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setEmail(email);
        user.setRole(role);
        user.setFullName(fullName);

        return userRepository.save(user);
    }

    public User updateUser(Long id, String username, String email, User.Role role, String fullName) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Verificar si el nuevo username ya existe y no pertenece al mismo usuario
            if (!user.getUsername().equals(username) && userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("El nombre de usuario ya existe");
            }

            // Verificar si el nuevo email ya existe y no pertenece al mismo usuario
            if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("El email ya está en uso");
            }

            user.setUsername(username);
            user.setEmail(email);
            user.setRole(role);
            user.setFullName(fullName);

            return userRepository.save(user);
        }
        throw new IllegalArgumentException("Usuario no encontrado");
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        userRepository.deleteById(id);
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role)
                .toList();
    }
}
