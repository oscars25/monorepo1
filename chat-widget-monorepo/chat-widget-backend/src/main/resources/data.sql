-- Insertar usuario admin con contraseña admin123
INSERT INTO users (username, password, email, role, full_name, is_enabled) VALUES
('admin', 'admin123', 'admin@example.com', 'ADMIN', 'Administrador del Sistema', true);