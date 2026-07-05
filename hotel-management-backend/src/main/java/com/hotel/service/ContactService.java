// src/main/java/com/hotel/service/ContactService.java
package com.hotel.service;

import com.hotel.entity.ContactMessage;
import com.hotel.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactService {
    private final ContactMessageRepository contactMessageRepository;

    public ContactService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    public ContactMessage saveMessage(ContactMessage message) {
        message.setCreatedAt(LocalDateTime.now());
        message.setIsRead(false);
        return contactMessageRepository.save(message);
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ContactMessage> getUnreadMessages() {
        return contactMessageRepository.findByIsReadFalse();
    }

    public List<ContactMessage> getMessagesByUserId(Integer userId) {
        return contactMessageRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public ContactMessage getMessageById(Long id) {
        return contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    public ContactMessage markAsRead(Long id) {
        ContactMessage message = getMessageById(id);
        message.setIsRead(true);
        return contactMessageRepository.save(message);
    }

    // ✅ Reply to message
    public ContactMessage replyToMessage(Long id, String reply, String repliedBy) {
        ContactMessage message = getMessageById(id);
        message.setReply(reply);
        message.setRepliedAt(LocalDateTime.now());
        message.setRepliedBy(repliedBy);
        message.setIsRead(true);
        return contactMessageRepository.save(message);
    }

    public void deleteMessage(Long id) {
        contactMessageRepository.deleteById(id);
    }
}