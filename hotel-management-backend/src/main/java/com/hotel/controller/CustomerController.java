// src/main/java/com/hotel/controller/CustomerController.java
package com.hotel.controller;

import com.hotel.entity.Customer;
import com.hotel.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // ✅ GET all customers (Admin & Receptionist)
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        try {
            List<Customer> customers = customerService.getAllCustomers();
            System.out.println("📋 Found " + customers.size() + " customers");
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            System.err.println("❌ Error fetching customers: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ GET customer by ID (Admin & Receptionist)
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(customerService.getCustomerById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ✅ GET customer by customer ID (Admin & Receptionist)
    @GetMapping("/customer-id/{customerId}")
    public ResponseEntity<Customer> getCustomerByCustomerId(@PathVariable String customerId) {
        try {
            return ResponseEntity.ok(customerService.getCustomerByCustomerId(customerId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ✅ GET customer by email (Admin & Receptionist)
    @GetMapping("/email/{email}")
    public ResponseEntity<Customer> getCustomerByEmail(@PathVariable String email) {
        try {
            return ResponseEntity.ok(customerService.getCustomerByEmail(email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ✅ GET customer by phone (Admin & Receptionist)
    @GetMapping("/phone/{phone}")
    public ResponseEntity<Customer> getCustomerByPhone(@PathVariable String phone) {
        try {
            return ResponseEntity.ok(customerService.getCustomerByPhone(phone));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ✅ SEARCH customers by name (Admin & Receptionist)
    @GetMapping("/search")
    public ResponseEntity<List<Customer>> searchCustomers(@RequestParam(required = false) String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.ok(customerService.getAllCustomers());
            }
            List<Customer> customers = customerService.searchCustomers(name);
            System.out.println("📋 Found " + customers.size() + " customers matching: " + name);
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            System.err.println("❌ Error searching customers: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ CREATE customer (Admin & Receptionist)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCustomer(@RequestBody Customer customer) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("📝 Creating customer: " + customer.getName());
            
            // ✅ Validate required fields
            if (customer.getName() == null || customer.getName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Customer name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            if (customer.getPhone() == null || customer.getPhone().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Phone number is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            Customer created = customerService.createCustomer(customer);
            System.out.println("✅ Customer created with ID: " + created.getId());
            
            response.put("success", true);
            response.put("message", "Customer added successfully!");
            response.put("data", created);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("❌ Error creating customer: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to add customer: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ UPDATE customer (Admin & Receptionist)
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCustomer(@PathVariable Integer id, @RequestBody Customer customer) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("📝 Updating customer: " + id);
            
            Customer updated = customerService.updateCustomer(id, customer);
            System.out.println("✅ Customer updated: " + updated.getId());
            
            response.put("success", true);
            response.put("message", "Customer updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error updating customer: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to update customer: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ DELETE customer (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCustomer(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("🗑️ Deleting customer: " + id);
            customerService.deleteCustomer(id);
            response.put("success", true);
            response.put("message", "Customer deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error deleting customer: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to delete customer: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}