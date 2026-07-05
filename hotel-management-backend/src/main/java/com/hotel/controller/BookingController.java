// src/main/java/com/hotel/controller/BookingController.java
package com.hotel.controller;

import com.hotel.entity.Booking;
import com.hotel.entity.Customer;
import com.hotel.entity.Login;
import com.hotel.service.BookingService;
import com.hotel.service.CustomerService;
import com.hotel.service.LoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class BookingController {
    private final BookingService bookingService;
    private final LoginService loginService;
    private final CustomerService customerService;

    public BookingController(BookingService bookingService, 
                            LoginService loginService,
                            CustomerService customerService) {
        this.bookingService = bookingService;
        this.loginService = loginService;
        this.customerService = customerService;
    }

    // ✅ Get all bookings (Admin & Receptionist)
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("👤 getAllBookings - User: " + auth.getName() + ", Role: " + auth.getAuthorities());
            return ResponseEntity.ok(bookingService.getAllBookings());
        } catch (Exception e) {
            System.err.println("❌ Error in getAllBookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Get MY bookings (Guest only)
    @GetMapping("/my-bookings")
    public ResponseEntity<List<Booking>> getMyBookings() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            System.out.println("👤 getMyBookings - User: " + username + ", Authorities: " + auth.getAuthorities());
            
            Login user = loginService.getLoginByUsername(username);
            if (user == null) {
                System.out.println("❌ User not found: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            System.out.println("✅ User found: " + user.getUsername() + ", Email: " + user.getEmail() + ", Role: " + user.getRole());
            
            // ✅ Try to find customer by email
            try {
                if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                    Customer customer = customerService.getCustomerByEmail(user.getEmail());
                    if (customer != null) {
                        List<Booking> bookings = bookingService.getBookingsByCustomerId(customer.getId());
                        System.out.println("📋 Found " + bookings.size() + " bookings for customer: " + customer.getName());
                        return ResponseEntity.ok(bookings);
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ Customer not found by email: " + e.getMessage());
            }
            
            // ✅ Try to find customer by phone
            try {
                if (user.getPhone() != null && !user.getPhone().isEmpty()) {
                    Customer customer = customerService.getCustomerByPhone(user.getPhone());
                    if (customer != null) {
                        List<Booking> bookings = bookingService.getBookingsByCustomerId(customer.getId());
                        System.out.println("📋 Found " + bookings.size() + " bookings by phone for: " + customer.getName());
                        return ResponseEntity.ok(bookings);
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ Customer not found by phone: " + e.getMessage());
            }
            
            // ✅ Try to find customer by name
            try {
                if (user.getFullName() != null && !user.getFullName().isEmpty()) {
                    List<Customer> customers = customerService.searchCustomers(user.getFullName());
                    if (!customers.isEmpty()) {
                        List<Booking> bookings = bookingService.getBookingsByCustomerId(customers.get(0).getId());
                        System.out.println("📋 Found " + bookings.size() + " bookings by name for: " + customers.get(0).getName());
                        return ResponseEntity.ok(bookings);
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ Customer not found by name: " + e.getMessage());
            }
            
            System.out.println("📋 No bookings found for user: " + username);
            return ResponseEntity.ok(List.of());
            
        } catch (Exception e) {
            System.err.println("❌ Error in getMyBookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Get today's bookings (Admin & Receptionist)
    @GetMapping("/today")
    public ResponseEntity<List<Booking>> getTodaysBookings() {
        try {
            return ResponseEntity.ok(bookingService.getTodaysBookings());
        } catch (Exception e) {
            System.err.println("❌ Error in getTodaysBookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Get upcoming bookings (Admin & Receptionist)
    @GetMapping("/upcoming")
    public ResponseEntity<List<Booking>> getUpcomingBookings() {
        try {
            return ResponseEntity.ok(bookingService.getUpcomingBookings());
        } catch (Exception e) {
            System.err.println("❌ Error in getUpcomingBookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Get active bookings - checked-in (Admin & Receptionist)
    @GetMapping("/active")
    public ResponseEntity<List<Booking>> getActiveBookings() {
        try {
            return ResponseEntity.ok(bookingService.getActiveBookings());
        } catch (Exception e) {
            System.err.println("❌ Error in getActiveBookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Get booking by ID (Admin & Receptionist)
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id));
        } catch (Exception e) {
            System.err.println("❌ Error in getBookingById: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ✅ Get bookings by customer ID (Admin & Receptionist)
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Booking>> getBookingsByCustomer(@PathVariable Integer customerId) {
        try {
            return ResponseEntity.ok(bookingService.getBookingsByCustomerId(customerId));
        } catch (Exception e) {
            System.err.println("❌ Error in getBookingsByCustomer: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Get bookings by status (Admin & Receptionist)
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable String status) {
        try {
            return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
        } catch (Exception e) {
            System.err.println("❌ Error in getBookingsByStatus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Check room availability (Public)
    @GetMapping("/check-availability")
    public ResponseEntity<List<Booking>> checkAvailability(
            @RequestParam Integer roomId,
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut) {
        try {
            return ResponseEntity.ok(bookingService.checkRoomAvailability(roomId, checkIn, checkOut));
        } catch (Exception e) {
            System.err.println("❌ Error in checkAvailability: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Create booking (Guest, Admin, Receptionist)
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            System.out.println("📝 Creating booking for room: " + (booking.getRoom() != null ? booking.getRoom().getId() : "null"));
            System.out.println("📝 Booking data: " + booking);
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            System.out.println("👤 Creating booking for user: " + username);
            
            Login user = loginService.getLoginByUsername(username);
            if (user == null) {
                System.out.println("❌ User not found: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            // ✅ Ensure customer has email and phone from logged in user
            if (booking.getCustomer() != null) {
                if (booking.getCustomer().getEmail() == null || booking.getCustomer().getEmail().isEmpty()) {
                    booking.getCustomer().setEmail(user.getEmail());
                }
                if (booking.getCustomer().getPhone() == null || booking.getCustomer().getPhone().isEmpty()) {
                    booking.getCustomer().setPhone(user.getPhone());
                }
                if (booking.getCustomer().getName() == null || booking.getCustomer().getName().isEmpty()) {
                    booking.getCustomer().setName(user.getFullName() != null ? user.getFullName() : user.getUsername());
                }
                System.out.println("👤 Customer: " + booking.getCustomer().getName() + ", Email: " + booking.getCustomer().getEmail());
            } else {
                // ✅ Create customer if null
                Customer customer = new Customer();
                customer.setName(user.getFullName() != null ? user.getFullName() : user.getUsername());
                customer.setEmail(user.getEmail());
                customer.setPhone(user.getPhone());
                booking.setCustomer(customer);
                System.out.println("👤 New customer created: " + customer.getName());
            }
            
            Booking created = bookingService.createBooking(booking);
            System.out.println("✅ Booking created with ID: " + created.getId());
            System.out.println("💰 Total Amount: " + created.getTotalAmount());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
            
        } catch (Exception e) {
            System.err.println("❌ Error creating booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // ✅ Update booking status (Admin & Receptionist)
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Integer id, @RequestParam String status) {
        try {
            System.out.println("📝 Updating booking " + id + " status to: " + status);
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
        } catch (Exception e) {
            System.err.println("❌ Error in updateBookingStatus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Update payment status (Admin & Receptionist)
    @PutMapping("/{id}/payment")
    public ResponseEntity<Booking> updatePaymentStatus(@PathVariable Integer id, @RequestParam String paymentStatus) {
        try {
            System.out.println("📝 Updating booking " + id + " payment to: " + paymentStatus);
            return ResponseEntity.ok(bookingService.updatePaymentStatus(id, paymentStatus));
        } catch (Exception e) {
            System.err.println("❌ Error in updatePaymentStatus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Cancel booking (Guest, Admin, Receptionist)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Integer id) {
        try {
            System.out.println("🗑️ Cancelling booking: " + id);
            bookingService.cancelBooking(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("❌ Error in cancelBooking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Delete booking - Hard delete (Admin only)
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<Void> deleteBooking(@PathVariable Integer id) {
        try {
            System.out.println("🗑️ Hard deleting booking: " + id);
            bookingService.deleteBooking(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("❌ Error in deleteBooking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}