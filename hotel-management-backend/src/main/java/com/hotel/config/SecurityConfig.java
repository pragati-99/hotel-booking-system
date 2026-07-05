// src/main/java/com/hotel/config/SecurityConfig.java
package com.hotel.config;

import com.hotel.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ✅ PUBLIC ENDPOINTS
                .requestMatchers("/auth/**", "/api/auth/**").permitAll()
                .requestMatchers("/api/rooms/available").permitAll()
                .requestMatchers("/api/rooms/public/**").permitAll()
                .requestMatchers("/api/contact").permitAll()
                .requestMatchers("/api/payments/**").permitAll()
                
                // ✅ PRE-BOOKING - Authenticated users only
                .requestMatchers("/api/pre-bookings/**").authenticated()
                .requestMatchers("/api/pre-bookings").authenticated()
                
                // ✅ GUEST ONLY - Specific endpoints
                .requestMatchers("/api/bookings/my-bookings").hasRole("GUEST")
                .requestMatchers("/api/contact/my-messages").hasRole("GUEST")
                .requestMatchers("/api/refunds/my-refunds").hasRole("GUEST")
                
                // ✅ GUEST CAN CREATE BOOKINGS - FIXED
                .requestMatchers("/api/bookings").hasAnyRole("GUEST", "ADMIN", "RECEPTIONIST")
                
                // ✅ ADMIN ONLY
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/employees/**").hasRole("ADMIN")
                .requestMatchers("/api/departments/**").hasRole("ADMIN")
                
                // ✅ ADMIN & RECEPTIONIST
                .requestMatchers("/api/receptionist/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers("/api/customers/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers("/api/drivers/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers("/api/refunds/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers("/api/rooms/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                
                // ✅ ALL OTHER REQUESTS - Authenticated
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:5173", 
            "http://localhost:5174", 
            "http://127.0.0.1:5173",
            "http://localhost:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}