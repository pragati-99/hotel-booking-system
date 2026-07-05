// src/main/java/com/hotel/controller/RefundController.java
package com.hotel.controller;

import com.hotel.entity.Refund;
import com.hotel.entity.Login;
import com.hotel.service.RefundService;
import com.hotel.service.LoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/refunds")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class RefundController {
    private final RefundService refundService;
    private final LoginService loginService;

    public RefundController(RefundService refundService, LoginService loginService) {
        this.refundService = refundService;
        this.loginService = loginService;
    }

    // ✅ GET all refunds (Admin & Receptionist)
    @GetMapping
    public ResponseEntity<List<Refund>> getAllRefunds() {
        try {
            List<Refund> refunds = refundService.getAllRefunds();
            System.out.println("📋 Found " + refunds.size() + " refunds");
            return ResponseEntity.ok(refunds);
        } catch (Exception e) {
            System.err.println("❌ Error fetching refunds: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ GET refund by ID (Admin & Receptionist)
    @GetMapping("/{id}")
    public ResponseEntity<Refund> getRefundById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(refundService.getRefundById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ✅ GET my refunds (Guest)
    @GetMapping("/my-refunds")
    public ResponseEntity<List<Refund>> getMyRefunds() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            System.out.println("👤 getMyRefunds - User: " + username);
            
            Login user = loginService.getLoginByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            List<Refund> refunds = refundService.getRefundsByUserId(user.getId());
            System.out.println("📋 Found " + refunds.size() + " refunds for user: " + username);
            return ResponseEntity.ok(refunds);
        } catch (Exception e) {
            System.err.println("❌ Error in getMyRefunds: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ GET refunds by status (Admin & Receptionist)
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Refund>> getRefundsByStatus(@PathVariable String status) {
        try {
            return ResponseEntity.ok(refundService.getRefundsByStatus(status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ CREATE refund (Guest, Admin, Receptionist)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createRefund(@RequestBody Refund refund) {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            System.out.println("👤 Creating refund for user: " + username);
            
            Login user = loginService.getLoginByUsername(username);
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            refund.setUserId(user.getId());
            refund.setCustomerName(user.getFullName() != null ? user.getFullName() : user.getUsername());
            refund.setCustomerEmail(user.getEmail());
            refund.setCustomerPhone(user.getPhone());
            refund.setRequestedAt(java.time.LocalDateTime.now());
            refund.setStatus("pending");
            
            Refund created = refundService.createRefund(refund);
            System.out.println("✅ Refund created with ID: " + created.getId());
            
            response.put("success", true);
            response.put("message", "Refund request submitted successfully");
            response.put("data", created);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("❌ Error creating refund: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to submit refund request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ UPDATE refund status (Admin & Receptionist)
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateRefundStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String status = request.get("status");
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String processedBy = auth.getName();
            
            System.out.println("📝 Updating refund " + id + " to status: " + status);
            
            Refund updated = refundService.updateRefundStatus(id, status, processedBy);
            
            response.put("success", true);
            response.put("message", "Refund " + status + " successfully");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error updating refund: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ DELETE refund (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRefund(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("🗑️ Deleting refund: " + id);
            refundService.deleteRefund(id);
            response.put("success", true);
            response.put("message", "Refund deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error deleting refund: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}