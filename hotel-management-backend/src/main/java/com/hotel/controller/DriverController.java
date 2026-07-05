// src/main/java/com/hotel/controller/DriverController.java
package com.hotel.controller;

import com.hotel.entity.Driver;
import com.hotel.service.DriverService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class DriverController {
    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    // ✅ GET all drivers
    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    // ✅ GET available drivers
    @GetMapping("/available")
    public ResponseEntity<List<Driver>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    // ✅ GET driver by ID
    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(@PathVariable Integer id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    // ✅ GET drivers by availability status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Driver>> getDriversByStatus(@PathVariable String status) {
        return ResponseEntity.ok(driverService.getDriversByStatus(status));
    }

    // ✅ SEARCH drivers
    @GetMapping("/search")
    public ResponseEntity<List<Driver>> searchDrivers(@RequestParam String keyword) {
        return ResponseEntity.ok(driverService.searchDrivers(keyword));
    }

    // ✅ CREATE driver
    @PostMapping
    public ResponseEntity<Driver> createDriver(@RequestBody Driver driver) {
        Driver created = driverService.createDriver(driver);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ✅ UPDATE driver
    @PutMapping("/{id}")
    public ResponseEntity<Driver> updateDriver(@PathVariable Integer id, @RequestBody Driver driver) {
        Driver updated = driverService.updateDriver(id, driver);
        return ResponseEntity.ok(updated);
    }

    // ✅ UPDATE driver availability status
    @PutMapping("/{id}/status")
    public ResponseEntity<Driver> updateDriverStatus(@PathVariable Integer id, @RequestParam String availability) {
        Driver updated = driverService.updateDriverStatus(id, availability);
        return ResponseEntity.ok(updated);
    }
 // ✅ UPDATE driver payment status
    @PutMapping("/{id}/payment")
    public ResponseEntity<Driver> updatePaymentStatus(
            @PathVariable Integer id, 
            @RequestBody Map<String, String> request) {
        String paymentStatus = request.get("paymentStatus");
        Driver updated = driverService.updatePaymentStatus(id, paymentStatus);
        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE driver
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDriver(@PathVariable Integer id) {
        driverService.deleteDriver(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Driver deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ✅ GET driver statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDriverStats() {
        return ResponseEntity.ok(driverService.getDriverStats());
    }
}