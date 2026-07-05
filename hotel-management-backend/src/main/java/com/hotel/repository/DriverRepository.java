// src/main/java/com/hotel/repository/DriverRepository.java
package com.hotel.repository;

import com.hotel.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    List<Driver> findByAvailability(String availability);
    List<Driver> findByNameContainingIgnoreCase(String keyword);
    List<Driver> findByPaymentStatus(String paymentStatus);
}