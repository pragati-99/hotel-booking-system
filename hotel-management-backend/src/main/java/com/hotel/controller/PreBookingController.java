// src/main/java/com/hotel/controller/PreBookingController.java
package com.hotel.controller;

import com.hotel.entity.PreBooking;
import com.hotel.entity.Login;
import com.hotel.service.PreBookingService;
import com.hotel.service.LoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pre-bookings")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PreBookingController {
    private final PreBookingService preBookingService;
    private final LoginService loginService;

    public PreBookingController(PreBookingService preBookingService, LoginService loginService) {
        this.preBookingService = preBookingService;
        this.loginService = loginService;
    }

    // ✅ Get all pre-bookings (Admin & Receptionist)
    @GetMapping
    public ResponseEntity<List<PreBooking>> getAllPreBookings() {
        try {
            List<PreBooking> preBookings = preBookingService.getAllPreBookings();
            System.out.println("📋 Found " + preBookings.size() + " pre-bookings");
            return ResponseEntity.ok(preBookings);
        } catch (Exception e) {
            System.err.println("❌ Error fetching pre-bookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Get my pre-bookings (Guest)
    @GetMapping("/my-pre-bookings")
    public ResponseEntity<List<PreBooking>> getMyPreBookings() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            Login user = loginService.getLoginByUsername(username);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            List<PreBooking> preBookings = preBookingService.getPreBookingsByUserId(user.getId());
            System.out.println("📋 Found " + preBookings.size() + " pre-bookings for user: " + username);
            return ResponseEntity.ok(preBookings);
        } catch (Exception e) {
            System.err.println("❌ Error fetching user pre-bookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Create pre-booking (Guest)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPreBooking(@RequestBody PreBooking preBooking) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("📝 Creating pre-booking: " + preBooking);
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            Login user = loginService.getLoginByUsername(username);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not found. Please login again.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // ✅ Set user
            preBooking.setUser(user);
            preBooking.setCreatedAt(LocalDateTime.now());
            preBooking.setStatus("pending");
            
            // ✅ Validate dates
            if (preBooking.getCheckInDate() == null || preBooking.getCheckOutDate() == null) {
                response.put("success", false);
                response.put("message", "Check-in and Check-out dates are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            if (preBooking.getCheckOutDate().isBefore(preBooking.getCheckInDate()) || 
                preBooking.getCheckOutDate().isEqual(preBooking.getCheckInDate())) {
                response.put("success", false);
                response.put("message", "Check-out date must be after check-in date");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // ✅ Save
            PreBooking created = preBookingService.createPreBooking(preBooking);
            System.out.println("✅ Pre-booking created with ID: " + created.getId());
            
            response.put("success", true);
            response.put("message", "Pre-booking request submitted successfully!");
            response.put("data", created);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error creating pre-booking: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to submit pre-booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ Update pre-booking status (Admin & Receptionist)
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updatePreBookingStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String status = request.get("status");
            System.out.println("📝 Updating pre-booking " + id + " to status: " + status);
            
            PreBooking updated = preBookingService.updatePreBookingStatus(id, status);
            
            response.put("success", true);
            response.put("message", "Pre-booking " + status + " successfully");
            response.put("data", updated);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error updating pre-booking: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ Delete pre-booking (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePreBooking(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            preBookingService.deletePreBooking(id);
            response.put("success", true);
            response.put("message", "Pre-booking deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}