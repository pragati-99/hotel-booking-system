// src/main/java/com/hotel/service/DriverService.java
package com.hotel.service;

import com.hotel.entity.Driver;
import com.hotel.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DriverService {
    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    // ✅ Get all drivers
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    // ✅ Get available drivers
    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByAvailability("available");
    }

    // ✅ Get driver by ID
    public Driver getDriverById(Integer id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + id));
    }

    // ✅ Get drivers by status
    public List<Driver> getDriversByStatus(String status) {
        return driverRepository.findByAvailability(status);
    }

    // ✅ Search drivers
    public List<Driver> searchDrivers(String keyword) {
        return driverRepository.findByNameContainingIgnoreCase(keyword);
    }

    // ✅ Create driver
    public Driver createDriver(Driver driver) {
        driver.setCreatedAt(LocalDateTime.now());
        if (driver.getAvailability() == null || driver.getAvailability().isEmpty()) {
            driver.setAvailability("available");
        }
        return driverRepository.save(driver);
    }

    // ✅ Update driver
    public Driver updateDriver(Integer id, Driver driverDetails) {
        Driver driver = getDriverById(id);
        driver.setName(driverDetails.getName());
        driver.setPhone(driverDetails.getPhone());
        driver.setCarModel(driverDetails.getCarModel());
        driver.setCarNumber(driverDetails.getCarNumber());
        driver.setAvailability(driverDetails.getAvailability());
        return driverRepository.save(driver);
    }

    // ✅ Update driver status only
    public Driver updateDriverStatus(Integer id, String availability) {
        Driver driver = getDriverById(id);
        driver.setAvailability(availability);
        return driverRepository.save(driver);
    }
 // ✅ Update payment status
    public Driver updatePaymentStatus(Integer id, String paymentStatus) {
        Driver driver = getDriverById(id);
        driver.setPaymentStatus(paymentStatus);
        return driverRepository.save(driver);
    }

    // ✅ Delete driver
    public void deleteDriver(Integer id) {
        Driver driver = getDriverById(id);
        driverRepository.deleteById(id);
    }

    // ✅ Get driver statistics
    public Map<String, Object> getDriverStats() {
        List<Driver> drivers = driverRepository.findAll();
        
        long total = drivers.size();
        long available = drivers.stream().filter(d -> "available".equals(d.getAvailability())).count();
        long busy = drivers.stream().filter(d -> "busy".equals(d.getAvailability())).count();
        long offDuty = drivers.stream().filter(d -> "off-duty".equals(d.getAvailability())).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("available", available);
        stats.put("busy", busy);
        stats.put("offDuty", offDuty);
        
        return stats;
    }
}