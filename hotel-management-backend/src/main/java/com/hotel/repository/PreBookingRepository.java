package com.hotel.repository;

import com.hotel.entity.PreBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreBookingRepository extends JpaRepository<PreBooking, Integer> {
    List<PreBooking> findByUserId(Integer userId);
    List<PreBooking> findByStatus(String status);
    List<PreBooking> findAllByOrderByCreatedAtDesc();
}