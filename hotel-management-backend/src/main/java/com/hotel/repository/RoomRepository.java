package com.hotel.repository;

import com.hotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    List<Room> findByStatus(String status);
    List<Room> findByRoomType(String roomType);
    List<Room> findByCapacityGreaterThanEqual(Integer capacity);
    
    @Query("SELECT r FROM Room r WHERE r.status = 'available' AND r.capacity >= :capacity")
    List<Room> findAvailableRoomsWithCapacity(Integer capacity);
}