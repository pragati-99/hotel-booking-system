// src/main/java/com/hotel/controller/ContactController.java
package com.hotel.controller;

import com.hotel.entity.ContactMessage;
import com.hotel.entity.Login;
import com.hotel.service.ContactService;
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
@RequestMapping("/api/contact")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ContactController {
    private final ContactService contactService;
    private final LoginService loginService;

    public ContactController(ContactService contactService, LoginService loginService) {
        this.contactService = contactService;
        this.loginService = loginService;
    }

    // ✅ Send message (Guest only)
    @PostMapping
    public ResponseEntity<ContactMessage> sendMessage(@RequestBody ContactMessage message) {
        // Get current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Login user = loginService.getLoginByUsername(username);
        if (user != null) {
            message.setUserId(user.getId());
            message.setEmail(user.getEmail() != null ? user.getEmail() : message.getEmail());
            message.setName(user.getFullName() != null ? user.getFullName() : message.getName());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.saveMessage(message));
    }

    // ✅ Get all messages (Admin only)
    @GetMapping
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    // ✅ Get messages by user (Guest sees only their own messages)
    @GetMapping("/my-messages")
    public ResponseEntity<List<ContactMessage>> getMyMessages() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Login user = loginService.getLoginByUsername(username);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return ResponseEntity.ok(contactService.getMessagesByUserId(user.getId()));
    }

    // ✅ Get unread messages (Admin only)
    @GetMapping("/unread")
    public ResponseEntity<List<ContactMessage>> getUnreadMessages() {
        return ResponseEntity.ok(contactService.getUnreadMessages());
    }

    // ✅ Get message by ID
    @GetMapping("/{id}")
    public ResponseEntity<ContactMessage> getMessageById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getMessageById(id));
    }

    // ✅ Mark message as read (Admin only)
    @PutMapping("/{id}/read")
    public ResponseEntity<ContactMessage> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.markAsRead(id));
    }

    // ✅ Reply to message (Admin only)
    @PostMapping("/{id}/reply")
    public ResponseEntity<Map<String, Object>> replyToMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String reply = request.get("reply");
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String repliedBy = auth.getName();
            
            ContactMessage updated = contactService.replyToMessage(id, reply, repliedBy);
            
            response.put("success", true);
            response.put("message", "Reply sent successfully");
            response.put("data", updated);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ Delete message (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        contactService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}