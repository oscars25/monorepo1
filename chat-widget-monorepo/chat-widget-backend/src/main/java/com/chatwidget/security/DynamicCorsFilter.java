package com.chatwidget.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;

@Component
public class DynamicCorsFilter extends HttpFilter {

    // Añadir http://localhost y 127.0.0.1
    private static final Set<String> ALLOWED = Set.of(
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://host.docker.internal:3000"
    );

    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        String origin = req.getHeader("Origin");
        if (origin != null) {
            if (ALLOWED.contains(origin)) {
                res.setHeader("Access-Control-Allow-Origin", origin);
                res.setHeader("Vary", "Origin");
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
                String reqHeaders = req.getHeader("Access-Control-Request-Headers");
                res.setHeader("Access-Control-Allow-Headers", reqHeaders != null ? reqHeaders : "Authorization,Content-Type");
                res.setHeader("Access-Control-Expose-Headers", "Authorization");
            }
        }

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }
}