// src/main/java/com/hotel/service/BookingService.java
package com.hotel.service;

import com.hotel.entity.Booking;
import com.hotel.entity.Customer;
import com.hotel.entity.Room;
import com.hotel.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomService roomService;
    private final CustomerService customerService;

    public BookingService(BookingRepository bookingRepository, 
                         RoomService roomService,
                         CustomerService customerService) {
        this.bookingRepository = bookingRepository;
        this.roomService = roomService;
        this.customerService = customerService;
    }

    // ✅ Fixed: Uses JOIN FETCH to avoid N+1
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithDetails();
    }

    public List<Booking> getCurrentBookings() {
        return bookingRepository.findCurrentBookings(LocalDate.now());
    }

    public List<Booking> getTodaysBookings() {
        return bookingRepository.findTodaysBookings(LocalDate.now());
    }

    public List<Booking> getUpcomingBookings() {
        return bookingRepository.findUpcomingBookings(LocalDate.now());
    }

    public List<Booking> getActiveBookings() {
        return bookingRepository.findActiveBookings();
    }

    // ✅ Fixed: Uses JOIN FETCH
    public Booking getBookingById(Integer id) {
        return bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
    }

    // ✅ Fixed: Uses JOIN FETCH
    public List<Booking> getBookingsByCustomerId(Integer customerId) {
        return bookingRepository.findByCustomerIdWithDetails(customerId);
    }

    public List<Booking> getBookingsByCustomerEmail(String email) {
        Customer customer = customerService.getCustomerByEmail(email);
        if (customer == null) {
            return List.of();
        }
        return bookingRepository.findByCustomerIdWithDetails(customer.getId());
    }

    public List<Booking> getBookingsByStatus(String status) {
        return bookingRepository.findByStatusWithDetails(status);
    }

    public List<Booking> checkRoomAvailability(Integer roomId, LocalDate checkIn, LocalDate checkOut) {
        return bookingRepository.findConflictingBookings(roomId, checkIn, checkOut);
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        Room room = roomService.getRoomById(booking.getRoom().getId());
        
        // ✅ Check room availability
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            room.getId(), 
            booking.getCheckInDate(), 
            booking.getCheckOutDate()
        );
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Room is not available for selected dates");
        }

        // ✅ Handle Customer
        Customer customer = booking.getCustomer();
        if (customer != null && customer.getName() != null && !customer.getName().isEmpty()) {
            Customer existingCustomer = null;
            
            if (customer.getPhone() != null && !customer.getPhone().isEmpty()) {
                try {
                    existingCustomer = customerService.getCustomerByPhone(customer.getPhone());
                } catch (Exception e) {
                    // Customer not found by phone
                }
            }
            
            if (existingCustomer == null && customer.getEmail() != null && !customer.getEmail().isEmpty()) {
                try {
                    existingCustomer = customerService.getCustomerByEmail(customer.getEmail());
                } catch (Exception e) {
                    // Customer not found by email
                }
            }
            
            if (existingCustomer == null) {
                String customerId = "CUST" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                customer.setCustomerId(customerId);
                customer.setCreatedAt(LocalDateTime.now());
                customer = customerService.createCustomer(customer);
            } else {
                customer = existingCustomer;
            }
        } else {
            throw new RuntimeException("Customer name is required");
        }
        
        booking.setCustomer(customer);
        
        // ✅ Generate booking number
        String bookingNumber = "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        booking.setBookingNumber(bookingNumber);
        
        // ✅ Calculate nights and total amount
        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        if (nights <= 0) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }
        booking.setTotalNights((int) nights);
        
        // ✅ FIX: Calculate total amount correctly
        BigDecimal totalAmount = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        booking.setTotalAmount(totalAmount);
        
        System.out.println("💰 Room price: " + room.getPricePerNight());
        System.out.println("💰 Nights: " + nights);
        System.out.println("💰 Total Amount: " + totalAmount);
        
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus("pending");
        booking.setPaymentStatus("pending");
        
        return bookingRepository.save(booking);
    }

    // ✅ Update booking status with proper payment handling
    @Transactional
    public Booking updateBookingStatus(Integer id, String status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        
        if ("checked-in".equals(status)) {
            booking.setCheckinTime(LocalDateTime.now());
            roomService.updateRoomStatus(booking.getRoom().getId(), "occupied");
        }
        
        if ("completed".equals(status)) {
            booking.setCheckoutTime(LocalDateTime.now());
            booking.setPaymentStatus("paid");
            roomService.updateRoomStatus(booking.getRoom().getId(), "available");
        }
        
        if ("confirmed".equals(status)) {
            // ✅ Set payment status to paid when confirmed
            booking.setPaymentStatus("paid");
            roomService.updateRoomStatus(booking.getRoom().getId(), "booked");
        }
        
        if ("cancelled".equals(status)) {
            booking.setPaymentStatus("cancelled");
            roomService.updateRoomStatus(booking.getRoom().getId(), "available");
        }
        
        return bookingRepository.save(booking);
    }

    // ✅ Update payment status only
    @Transactional
    public Booking updatePaymentStatus(Integer id, String paymentStatus) {
        Booking booking = getBookingById(id);
        booking.setPaymentStatus(paymentStatus);
        
        // If payment is successful, update booking status to confirmed
        if ("paid".equals(paymentStatus)) {
            booking.setStatus("confirmed");
            roomService.updateRoomStatus(booking.getRoom().getId(), "booked");
        }
        
        return bookingRepository.save(booking);
    }

    // ✅ Update payment status only (without changing booking status)
    @Transactional
    public Booking updatePaymentStatusOnly(Integer id, String paymentStatus) {
        Booking booking = getBookingById(id);
        booking.setPaymentStatus(paymentStatus);
        return bookingRepository.save(booking);
    }

    // ✅ Cancel booking
    @Transactional
    public void cancelBooking(Integer id) {
        Booking booking = getBookingById(id);
        booking.setStatus("cancelled");
        booking.setPaymentStatus("cancelled");
        roomService.updateRoomStatus(booking.getRoom().getId(), "available");
        bookingRepository.save(booking);
    }

    // ✅ Delete booking (hard delete)
    @Transactional
    public void deleteBooking(Integer id) {
        Booking booking = getBookingById(id);
        roomService.updateRoomStatus(booking.getRoom().getId(), "available");
        bookingRepository.deleteById(id);
    }

    // ✅ Get bookings by date range
    public List<Booking> getBookingsByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findBookingsInRange(startDate, endDate);
    }

    // ✅ Get all bookings sorted by date
    public List<Booking> getBookingsSortedByDate() {
        return bookingRepository.findAllByOrderByBookingDateDesc();
    }
}