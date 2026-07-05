// src/main/java/com/hotel/repository/BookingRepository.java
package com.hotel.repository;

import com.hotel.entity.Booking;
import com.hotel.entity.Customer;
import com.hotel.entity.Room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    // ✅ JOIN FETCH to avoid N+1
    @Query("SELECT b FROM Booking b JOIN FETCH b.customer JOIN FETCH b.room ORDER BY b.bookingDate DESC")
    List<Booking> findAllWithDetails();
    
    @Query("SELECT b FROM Booking b JOIN FETCH b.customer JOIN FETCH b.room WHERE b.customer.id = :customerId")
    List<Booking> findByCustomerIdWithDetails(@Param("customerId") Integer customerId);
    
    @Query("SELECT b FROM Booking b JOIN FETCH b.customer JOIN FETCH b.room WHERE b.status = :status")
    List<Booking> findByStatusWithDetails(@Param("status") String status);
    
    @Query("SELECT b FROM Booking b JOIN FETCH b.customer JOIN FETCH b.room WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Integer id);
    
    // ✅ Basic methods
    List<Booking> findByCustomer(Customer customer);
    List<Booking> findByRoom(Room room);
    List<Booking> findByStatus(String status);
    List<Booking> findByCustomerId(Integer customerId);
    List<Booking> findAllByOrderByBookingDateDesc();
    
    // ✅ Current bookings
    @Query("SELECT b FROM Booking b WHERE b.checkOutDate >= :today OR b.status = 'checked-in' ORDER BY b.checkInDate ASC")
    List<Booking> findCurrentBookings(@Param("today") LocalDate today);
    
    // ✅ Today's bookings
    @Query("SELECT b FROM Booking b WHERE b.checkInDate = :today OR b.checkOutDate = :today OR b.status = 'checked-in'")
    List<Booking> findTodaysBookings(@Param("today") LocalDate today);
    
    // ✅ Bookings in date range - FIXED with @Query
    @Query("SELECT b FROM Booking b WHERE b.checkInDate <= :endDate AND b.checkOutDate >= :startDate AND b.status != 'cancelled'")
    List<Booking> findBookingsInRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // ✅ Active bookings
    @Query("SELECT b FROM Booking b WHERE b.status = 'checked-in'")
    List<Booking> findActiveBookings();
    
    // ✅ Upcoming bookings
    @Query("SELECT b FROM Booking b WHERE b.status = 'confirmed' AND b.checkInDate >= :today ORDER BY b.checkInDate ASC")
    List<Booking> findUpcomingBookings(@Param("today") LocalDate today);
    
    // ✅ Conflicting bookings
    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND b.status IN ('confirmed', 'checked-in') " +
           "AND ((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn))")
    List<Booking> findConflictingBookings(@Param("roomId") Integer roomId, 
                                         @Param("checkIn") LocalDate checkIn, 
                                         @Param("checkOut") LocalDate checkOut);
}