// src/main/java/com/hotel/repository/ContactMessageRepository.java
package com.hotel.repository;

import com.hotel.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findByIsReadFalse();
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
    List<ContactMessage> findByUserIdOrderByCreatedAtDesc(Integer userId);
}