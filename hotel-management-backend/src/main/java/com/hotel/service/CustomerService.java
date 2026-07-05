// src/main/java/com/hotel/service/CustomerService.java
package com.hotel.service;

import com.hotel.entity.Customer;
import com.hotel.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // ✅ Get all customers
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // ✅ Get customer by ID
    public Customer getCustomerById(Integer id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + id));
    }

    // ✅ Get customer by Customer ID
    public Customer getCustomerByCustomerId(String customerId) {
        return customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with Customer ID: " + customerId));
    }

    // ✅ Get customer by Email
    public Customer getCustomerByEmail(String email) {
        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email cannot be empty");
        }
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found with email: " + email));
    }

    // ✅ Get customer by Phone
    public Customer getCustomerByPhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            throw new RuntimeException("Phone cannot be empty");
        }
        return customerRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Customer not found with phone: " + phone));
    }

    // ✅ Search customers by name
    public List<Customer> searchCustomers(String name) {
        if (name == null || name.trim().isEmpty()) {
            return List.of();
        }
        return customerRepository.findByNameContaining(name.trim());
    }

    // ✅ Create customer
    @Transactional
    public Customer createCustomer(Customer customer) {
        // Generate Customer ID if not provided
        if (customer.getCustomerId() == null || customer.getCustomerId().isEmpty()) {
            customer.setCustomerId("CUST" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        customer.setCreatedAt(LocalDateTime.now());
        return customerRepository.save(customer);
    }

    // ✅ Update customer
    @Transactional
    public Customer updateCustomer(Integer id, Customer customerDetails) {
        Customer customer = getCustomerById(id);
        
        if (customerDetails.getName() != null && !customerDetails.getName().isEmpty()) {
            customer.setName(customerDetails.getName());
        }
        if (customerDetails.getEmail() != null && !customerDetails.getEmail().isEmpty()) {
            customer.setEmail(customerDetails.getEmail());
        }
        if (customerDetails.getPhone() != null && !customerDetails.getPhone().isEmpty()) {
            customer.setPhone(customerDetails.getPhone());
        }
        if (customerDetails.getAddress() != null) {
            customer.setAddress(customerDetails.getAddress());
        }
        if (customerDetails.getIdProof() != null && !customerDetails.getIdProof().isEmpty()) {
            customer.setIdProof(customerDetails.getIdProof());
        }
        if (customerDetails.getIdProofNumber() != null && !customerDetails.getIdProofNumber().isEmpty()) {
            customer.setIdProofNumber(customerDetails.getIdProofNumber());
        }
        
        return customerRepository.save(customer);
    }

    // ✅ Delete customer
    @Transactional
    public void deleteCustomer(Integer id) {
        Customer customer = getCustomerById(id);
        customerRepository.deleteById(id);
    }
}