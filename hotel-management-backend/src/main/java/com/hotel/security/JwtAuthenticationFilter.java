// src/main/java/com/hotel/security/JwtAuthenticationFilter.java
package com.hotel.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();
        
        // Skip for OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Skip for public endpoints
        boolean isPublicEndpoint = requestURI.startsWith("/api/auth") || 
                                   requestURI.startsWith("/auth") ||
                                   requestURI.startsWith("/api/rooms/available") ||
                                   requestURI.startsWith("/api/contact") ||
                                   requestURI.startsWith("/api/payments") ||
                                   requestURI.startsWith("/error");
        
        if (!isPublicEndpoint) {
            System.out.println("🔑 Auth Header for " + requestURI + ": " + (authHeader != null ? "Present" : "null"));
        }
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                
                if (!isPublicEndpoint) {
                    System.out.println("👤 Extracted - Username: " + username + ", Role: " + role);
                }
                
                if (username != null && !username.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // ✅ Create authentication with proper role
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(
                            username, 
                            null, 
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    if (!isPublicEndpoint) {
                        System.out.println("✅ Authentication set for: " + username + " with role: ROLE_" + role);
                        System.out.println("✅ SecurityContext: " + SecurityContextHolder.getContext().getAuthentication());
                    }
                }
            } catch (Exception e) {
                System.out.println("❌ Invalid token for " + requestURI + ": " + e.getMessage());
                // Don't set authentication if token is invalid
            }
        } else {
            if (!isPublicEndpoint && !requestURI.startsWith("/error")) {
                System.out.println("❌ No Bearer token found for " + requestURI);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}