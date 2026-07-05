package com.hotel.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin")
public class Checkin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "expected_checkout")
    private LocalDate expectedCheckout;

    @Column(name = "actual_checkout")
    private LocalDate actualCheckout;

    private String status = "checked_in";

    private String notes;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }
    public LocalDate getExpectedCheckout() { return expectedCheckout; }
    public void setExpectedCheckout(LocalDate expectedCheckout) { this.expectedCheckout = expectedCheckout; }
    public LocalDate getActualCheckout() { return actualCheckout; }
    public void setActualCheckout(LocalDate actualCheckout) { this.actualCheckout = actualCheckout; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}