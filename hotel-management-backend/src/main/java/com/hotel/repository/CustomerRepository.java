// src/main/java/com/hotel/repository/CustomerRepository.java
package com.hotel.repository;

import com.hotel.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByCustomerId(String customerId);
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByEmail(String email);
    List<Customer> findByNameContaining(String name);
    List<Customer> findByNameContainingIgnoreCase(String name);
}