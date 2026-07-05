// src/main/java/com/hotel/controller/AuthController.java
package com.hotel.controller;

import com.hotel.entity.Login;
import com.hotel.security.JwtUtil;
import com.hotel.service.LoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"})
public class AuthController {
    private final LoginService loginService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(LoginService loginService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.loginService = loginService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // ============================================
    // LOGIN - All users (Case-Insensitive)
    // ============================================
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Login login) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("🔐 Login attempt for: " + login.getUsername());
            
            // ✅ Validate input
            if (login.getUsername() == null || login.getUsername().isEmpty()) {
                response.put("success", false);
                response.put("message", "Username is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            if (login.getPassword() == null || login.getPassword().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // ✅ Case-insensitive search
            Login user = loginService.getLoginByUsernameOrEmail(login.getUsername());
            
            if (user == null) {
                System.out.println("❌ User not found: " + login.getUsername());
                response.put("success", false);
                response.put("message", "Invalid username or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            System.out.println("✅ User found: " + user.getUsername() + ", Role: " + user.getRole());
            
            // ✅ Check password
            boolean passwordMatches = passwordEncoder.matches(login.getPassword(), user.getPassword());
            System.out.println("✅ Password matches: " + passwordMatches);
            
            if (!passwordMatches) {
                response.put("success", false);
                response.put("message", "Invalid username or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // ✅ Check if user is active
            if (!user.getIsActive()) {
                response.put("success", false);
                response.put("message", "Account is deactivated. Please contact admin.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // ✅ Generate JWT token with role
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            System.out.println("✅ Token generated for: " + user.getUsername() + " with role: " + user.getRole());
            
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName() != null ? user.getFullName() : user.getUsername());
            response.put("email", user.getEmail());
            
            System.out.println("✅ Login successful for: " + user.getUsername());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============================================
    // REGISTER - Only GUEST users
    // ============================================
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Login login) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📝 Registration attempt for: " + login.getUsername());
            
            // ✅ Validate username
            if (login.getUsername() == null || login.getUsername().isEmpty()) {
                response.put("success", false);
                response.put("message", "Username is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            if (login.getUsername().length() < 3) {
                response.put("success", false);
                response.put("message", "Username must be at least 3 characters");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // ✅ Check if username already exists (case-insensitive)
            if (loginService.getLoginByUsername(login.getUsername()) != null) {
                response.put("success", false);
                response.put("message", "Username already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // ✅ Check if email already exists (case-insensitive)
            if (login.getEmail() != null && !login.getEmail().isEmpty()) {
                if (loginService.getLoginByEmail(login.getEmail()) != null) {
                    response.put("success", false);
                    response.put("message", "Email already registered");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
                }
            }

            // ✅ Validate password
            if (login.getPassword() == null || login.getPassword().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            if (login.getPassword().length() < 6) {
                response.put("success", false);
                response.put("message", "Password must be at least 6 characters");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // ✅ Set role to GUEST for registration
            login.setRole("GUEST");
            login.setIsActive(true);

            // ✅ Encode password and save
            String encodedPassword = passwordEncoder.encode(login.getPassword());
            login.setPassword(encodedPassword);
            login.setCreatedAt(java.time.LocalDateTime.now());
            login.setUpdatedAt(java.time.LocalDateTime.now());
            
            Login savedUser = loginService.createLogin(login);
            
            // ✅ Remove password from response
            savedUser.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Registration successful! Please login.");
            response.put("user", savedUser);
            
            System.out.println("✅ Registration successful for: " + savedUser.getUsername() + " with role: " + savedUser.getRole());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            System.err.println("❌ Registration error: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============================================
    // VERIFY TOKEN
    // ============================================
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "No token provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            
            System.out.println("🔍 Verifying token for: " + username + ", Role: " + role);
            
            if (username == null || jwtUtil.isTokenExpired(token)) {
                response.put("success", false);
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            response.put("success", true);
            response.put("username", username);
            response.put("role", role != null ? role : "GUEST");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Token verification error: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Invalid token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // ============================================
    // LOGOUT - Clear token on client side
    // ============================================
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    // ============================================
    // CHANGE PASSWORD
    // ============================================
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestHeader(value = "Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "No token provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            
            if (username == null || jwtUtil.isTokenExpired(token)) {
                response.put("success", false);
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            
            if (oldPassword == null || oldPassword.isEmpty() || newPassword == null || newPassword.isEmpty()) {
                response.put("success", false);
                response.put("message", "Old password and new password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            if (newPassword.length() < 6) {
                response.put("success", false);
                response.put("message", "New password must be at least 6 characters");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            Login user = loginService.getLoginByUsername(username);
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                response.put("success", false);
                response.put("message", "Old password is incorrect");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdatedAt(java.time.LocalDateTime.now());
            loginService.createLogin(user);
            
            response.put("success", true);
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Change password error: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============================================
    // GET USER PROFILE
    // ============================================
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @RequestHeader(value = "Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "No token provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            
            if (username == null || jwtUtil.isTokenExpired(token)) {
                response.put("success", false);
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Login user = loginService.getLoginByUsername(username);
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            user.setPassword(null);
            
            response.put("success", true);
            response.put("user", user);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Get profile error: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to get profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}