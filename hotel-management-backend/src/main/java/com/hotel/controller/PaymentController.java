// src/main/java/com/hotel/controller/PaymentController.java
package com.hotel.controller;

import com.hotel.entity.Booking;
import com.hotel.service.BookingService;
import com.hotel.service.RoomService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final BookingService bookingService;
    private final RoomService roomService;

    public PaymentController(BookingService bookingService, RoomService roomService) {
        this.bookingService = bookingService;
        this.roomService = roomService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Integer bookingId = (Integer) request.get("bookingId");
            Double amount = ((Number) request.get("amount")).doubleValue();
            
            System.out.println("💰 Creating order for booking: " + bookingId + ", Amount: " + amount);
            
            if (amount == null || amount <= 0) {
                response.put("success", false);
                response.put("message", "Invalid amount");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            int amountInPaise = (int) Math.round(amount * 100);
            
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + bookingId);
            orderRequest.put("payment_capture", 1);
            
            Order order = razorpayClient.orders.create(orderRequest);
            
            System.out.println("✅ Order created: " + order.get("id"));
            
            response.put("success", true);
            response.put("orderId", order.get("id"));
            response.put("amount", amountInPaise);
            response.put("currency", "INR");
            response.put("key", razorpayKeyId);
            response.put("bookingId", bookingId);
            
            return ResponseEntity.ok(response);
            
        } catch (RazorpayException e) {
            System.err.println("❌ Razorpay error: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Payment gateway error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String orderId = (String) request.get("razorpay_order_id");
            String paymentId = (String) request.get("razorpay_payment_id");
            String signature = (String) request.get("razorpay_signature");
            Integer bookingId = (Integer) request.get("bookingId");
            
            System.out.println("🔐 Verifying payment for booking: " + bookingId);
            System.out.println("📦 Order ID: " + orderId);
            System.out.println("💳 Payment ID: " + paymentId);
            System.out.println("✍️ Signature from Razorpay: " + signature);
            
            // ✅ USE RAZORPAY'S OFFICIAL VERIFICATION METHOD
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);
            
            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            System.out.println("✅ Signature valid: " + isValid);
            
            if (!isValid) {
                System.out.println("❌ Signature mismatch!");
                response.put("success", false);
                response.put("message", "Invalid payment signature");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            System.out.println("✅ Signature verified!");
            
            // ✅ Update booking
            Booking booking = bookingService.getBookingById(bookingId);
            
            // ✅ Update payment status to PAID
            booking.setPaymentStatus("paid");
            
            // ✅ Update booking status to CONFIRMED
            booking.setStatus("confirmed");
            
            // ✅ Save booking
            bookingService.updateBookingStatus(bookingId, "confirmed");
            
            // ✅ Update room status to booked
            roomService.updateRoomStatus(booking.getRoom().getId(), "booked");
            
            System.out.println("✅ Booking " + bookingId + " updated: Payment=paid, Status=confirmed");
            
            response.put("success", true);
            response.put("message", "Payment verified successfully");
            response.put("paymentId", paymentId);
            response.put("bookingId", bookingId);
            response.put("bookingNumber", booking.getBookingNumber());
            response.put("paymentStatus", "paid");
            response.put("status", "confirmed");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Verification error: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getPaymentSummary() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Booking> bookings = bookingService.getAllBookings();
            
            double totalRevenue = bookings.stream()
                    .filter(b -> "paid".equals(b.getPaymentStatus()))
                    .mapToDouble(b -> b.getTotalAmount().doubleValue() * 83)
                    .sum();
            
            long totalBookings = bookings.size();
            long paidBookings = bookings.stream().filter(b -> "paid".equals(b.getPaymentStatus())).count();
            long pendingPayments = bookings.stream().filter(b -> "pending".equals(b.getPaymentStatus())).count();
            double pendingAmount = bookings.stream()
                    .filter(b -> "pending".equals(b.getPaymentStatus()))
                    .mapToDouble(b -> b.getTotalAmount().doubleValue() * 83)
                    .sum();
            
            response.put("success", true);
            response.put("totalRevenue", totalRevenue);
            response.put("totalBookings", totalBookings);
            response.put("paidBookings", paidBookings);
            response.put("pendingPayments", pendingPayments);
            response.put("pendingAmount", pendingAmount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}