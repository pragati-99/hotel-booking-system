// src/main/java/com/hotel/repository/RefundRepository.java
package com.hotel.repository;

import com.hotel.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Integer> {
    List<Refund> findByStatus(String status);
    List<Refund> findByUserId(Integer userId);
    List<Refund> findByBookingNumber(String bookingNumber);
    List<Refund> findByOrderByRequestedAtDesc();
}