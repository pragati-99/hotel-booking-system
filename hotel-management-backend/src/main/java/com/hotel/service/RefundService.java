// src/main/java/com/hotel/service/RefundService.java
package com.hotel.service;

import com.hotel.entity.Refund;
import com.hotel.repository.RefundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RefundService {
    private final RefundRepository refundRepository;

    public RefundService(RefundRepository refundRepository) {
        this.refundRepository = refundRepository;
    }

    // ✅ Get all refunds
    public List<Refund> getAllRefunds() {
        return refundRepository.findByOrderByRequestedAtDesc();
    }

    // ✅ Get refund by ID
    public Refund getRefundById(Integer id) {
        return refundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refund not found with ID: " + id));
    }

    // ✅ Get refunds by user ID
    public List<Refund> getRefundsByUserId(Integer userId) {
        if (userId == null) {
            return List.of();
        }
        return refundRepository.findByUserId(userId);
    }

    // ✅ Get refunds by status
    public List<Refund> getRefundsByStatus(String status) {
        return refundRepository.findByStatus(status);
    }

    // ✅ Create refund
    @Transactional
    public Refund createRefund(Refund refund) {
        refund.setRequestedAt(LocalDateTime.now());
        refund.setStatus("pending");
        return refundRepository.save(refund);
    }

    // ✅ Update refund status
    @Transactional
    public Refund updateRefundStatus(Integer id, String status, String processedBy) {
        Refund refund = getRefundById(id);
        refund.setStatus(status);
        refund.setProcessedAt(LocalDateTime.now());
        refund.setProcessedBy(processedBy);
        return refundRepository.save(refund);
    }

    // ✅ Delete refund
    @Transactional
    public void deleteRefund(Integer id) {
        refundRepository.deleteById(id);
    }
}