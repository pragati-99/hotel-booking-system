package com.hotel.controller;

import com.hotel.entity.Booking;
import com.hotel.entity.Room;
import com.hotel.service.BookingService;
import com.hotel.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {
    private final RoomService roomService;
    private final BookingService bookingService;

    public DashboardController(RoomService roomService, BookingService bookingService) {
        this.roomService = roomService;
        this.bookingService = bookingService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalRooms", roomService.getAllRooms().size());
        stats.put("availableRooms", roomService.getAvailableRooms().size());
        stats.put("bookedRooms", roomService.getAllRooms().size() - roomService.getAvailableRooms().size());
        stats.put("totalBookings", bookingService.getAllBookings().size());
        
        long confirmedBookings = bookingService.getAllBookings().stream()
                .filter(b -> "confirmed".equals(b.getStatus()))
                .count();
        stats.put("confirmedBookings", confirmedBookings);
        
        return ResponseEntity.ok(stats);
    }
}