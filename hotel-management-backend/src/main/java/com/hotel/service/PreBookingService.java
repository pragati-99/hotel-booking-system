// src/main/java/com/hotel/service/PreBookingService.java
package com.hotel.service;

import com.hotel.entity.PreBooking;
import com.hotel.repository.PreBookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PreBookingService {
    private final PreBookingRepository preBookingRepository;

    public PreBookingService(PreBookingRepository preBookingRepository) {
        this.preBookingRepository = preBookingRepository;
    }

    public List<PreBooking> getAllPreBookings() {
        return preBookingRepository.findAll();
    }

    public List<PreBooking> getPreBookingsByUserId(Integer userId) {
        return preBookingRepository.findByUserId(userId);
    }

    public List<PreBooking> getPreBookingsByStatus(String status) {
        return preBookingRepository.findByStatus(status);
    }

    public PreBooking createPreBooking(PreBooking preBooking) {
        return preBookingRepository.save(preBooking);
    }

    public PreBooking updatePreBookingStatus(Integer id, String status) {
        PreBooking preBooking = preBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pre-booking not found with ID: " + id));
        preBooking.setStatus(status);
        return preBookingRepository.save(preBooking);
    }

    public void deletePreBooking(Integer id) {
        PreBooking preBooking = preBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pre-booking not found with ID: " + id));
        preBookingRepository.deleteById(id);
    }
}