package com.chatwidget.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration("securityBeansConfig")
public class SecurityBeansConfig {

    // Solo registramos el DaoAuthenticationProvider y usamos el PasswordEncoder/autenticationManager
    // definidos en com.chatwidget.security.SecurityConfig para evitar duplicados.
    @Bean("daoAuthProvider")
    public DaoAuthenticationProvider daoAuthenticationProvider(UserDetailsService userDetailsService,
                                                               PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider prov = new DaoAuthenticationProvider();
        prov.setUserDetailsService(userDetailsService);
        prov.setPasswordEncoder(passwordEncoder);
        return prov;
    }
}