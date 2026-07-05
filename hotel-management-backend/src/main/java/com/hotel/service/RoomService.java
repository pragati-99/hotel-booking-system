package com.hotel.service;

import com.hotel.entity.Room;
import com.hotel.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomService {
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Integer id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public List<Room> getAvailableRooms() {
        return roomRepository.findByStatus("available");
    }

    public List<Room> getRoomsByType(String roomType) {
        return roomRepository.findByRoomType(roomType);
    }

    public List<Room> searchAvailableRooms(Integer capacity) {
        return roomRepository.findAvailableRoomsWithCapacity(capacity);
    }

    public Room createRoom(Room room) {
        room.setCreatedAt(LocalDateTime.now());
        room.setStatus("available");
        return roomRepository.save(room);
    }

    public Room updateRoom(Integer id, Room roomDetails) {
        Room room = getRoomById(id);
        room.setRoomNumber(roomDetails.getRoomNumber());
        room.setRoomType(roomDetails.getRoomType());
        room.setBedType(roomDetails.getBedType());
        room.setPricePerNight(roomDetails.getPricePerNight());
        room.setCapacity(roomDetails.getCapacity());
        room.setStatus(roomDetails.getStatus());
        room.setFloor(roomDetails.getFloor());
        room.setDescription(roomDetails.getDescription());
        room.setImageUrl(roomDetails.getImageUrl());
        return roomRepository.save(room);
    }

    public void deleteRoom(Integer id) {
        roomRepository.deleteById(id);
    }

    public void updateRoomStatus(Integer id, String status) {
        Room room = getRoomById(id);
        room.setStatus(status);
        roomRepository.save(room);
    }
}