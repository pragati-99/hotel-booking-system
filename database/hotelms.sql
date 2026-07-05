-- =============================================
-- FINAL DATABASE SETUP - HOTEL MANAGEMENT SYSTEM
-- =============================================

-- =============================================
-- 1. DISABLE SAFE MODE
-- =============================================
SET SQL_SAFE_UPDATES = 0;

-- =============================================
-- 2. CREATE DATABASE
-- =============================================
CREATE DATABASE IF NOT EXISTS hotelms;

USE hotelms;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 3. DROP EXISTING TABLES (Correct Order)
-- =============================================
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS pre_booking;
DROP TABLE IF EXISTS refund;
DROP TABLE IF EXISTS checkin;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS login2;

-- =============================================
-- 4. CREATE TABLES
-- =============================================

-- 4.1 LOGIN TABLE
CREATE TABLE login2 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100),
    phone VARCHAR(15),
    role VARCHAR(20) DEFAULT 'GUEST',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4.2 CUSTOMER TABLE
CREATE TABLE customer (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15) NOT NULL,
    address TEXT,
    id_proof VARCHAR(50),
    id_proof_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.3 ROOMS TABLE
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    bed_type VARCHAR(30) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    floor INT,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.4 BOOKING TABLE
CREATE TABLE booking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT,
    room_id INT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INT,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checkin_time TIMESTAMP NULL,
    checkout_time TIMESTAMP NULL,
    guests INT DEFAULT 1,
    special_requests TEXT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 4.5 EMPLOYEE TABLE
CREATE TABLE employee (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    job_title VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE,
    address TEXT,
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.6 DRIVERS TABLE
CREATE TABLE drivers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    car_model VARCHAR(50),
    car_number VARCHAR(20),
    availability VARCHAR(20) DEFAULT 'available',
    payment_status VARCHAR(20) DEFAULT 'pending',
    salary DECIMAL(10,2) DEFAULT 25000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.7 DEPARTMENT TABLE
CREATE TABLE department (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    budget DECIMAL(15,2),
    head_of_department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.8 CONTACT MESSAGES TABLE
CREATE TABLE contact_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reply TEXT,
    replied_at TIMESTAMP NULL,
    replied_by VARCHAR(100),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.9 CHECKIN TABLE
CREATE TABLE checkin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    customer_id INT,
    room_id INT,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_checkout DATE,
    actual_checkout DATE,
    status VARCHAR(20) DEFAULT 'checked_in',
    notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 4.10 REFUND TABLE
CREATE TABLE refund (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    booking_number VARCHAR(20),
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(15),
    amount DECIMAL(10,2),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by VARCHAR(50),
    user_id INT,
    FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE SET NULL
);

-- 4.11 PRE-BOOKING TABLE
CREATE TABLE pre_booking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    room_type VARCHAR(50),
    guests INT DEFAULT 1,
    check_in_date DATE,
    check_out_date DATE,
    note TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES login2(id) ON DELETE SET NULL
);

-- 4.12 NOTIFICATION TABLE
CREATE TABLE notification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(100),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES login2(id) ON DELETE CASCADE
);

-- 4.13 ACTIVITY LOG TABLE
CREATE TABLE activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    username VARCHAR(50),
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES login2(id) ON DELETE SET NULL
);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 5. INSERT DEFAULT USERS (Password: admin123)
-- =============================================

INSERT INTO login2 (username, password, email, full_name, role, is_active) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKpVZ8XW', 'admin@hotel.com', 'System Admin', 'ADMIN', 1),
('reception1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKpVZ8XW', 'reception1@hotel.com', 'Priya Sharma', 'RECEPTIONIST', 1),
('guest1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKpVZ8XW', 'guest1@gmail.com', 'Rahul Sharma', 'GUEST', 1),
('snehal', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKpVZ8XW', 'snehal.varma@hotel.com', 'Snehal Varma', 'RECEPTIONIST', 1),
('priya', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKpVZ8XW', 'priya.sharma@hotel.com', 'Priya Sharma', 'RECEPTIONIST', 1),
('pragati', '$2a$10$l70sVD6qYqbZ2BoU4bt3qOYXrIdFwEMRmiJkap.II6hKhCY5wUsvy', 'khotpragati99@gmail.com', 'Pragati Khot', 'GUEST', 1);

-- =============================================
-- 6. INSERT SAMPLE ROOMS
-- =============================================
INSERT INTO rooms (room_number, room_type, bed_type, price_per_night, capacity, status, floor, description, image_url) VALUES
('101', 'Deluxe King', 'King', 89.00, 2, 'available', 1, 'Luxury king room with ocean view.', '/images/room-1.jpeg'),
('102', 'Deluxe King', 'King', 89.00, 2, 'available', 1, 'Luxury king room with garden view.', '/images/room-2-720x720.jpeg'),
('103', 'Twin Room', 'Twin', 65.00, 2, 'available', 1, 'Comfortable twin room with city view.', '/images/room-3-720x720.jpeg'),
('104', 'Twin Room', 'Twin', 65.00, 2, 'available', 1, 'Comfortable twin room with garden view.', '/images/room-3-720x720.jpeg'),
('105', 'Suite', 'King', 149.00, 4, 'available', 2, 'Spacious suite with separate living area.', '/images/room-4-720x720.jpeg'),
('106', 'Suite', 'King', 149.00, 4, 'available', 2, 'Luxury suite with ocean view and jacuzzi.', '/images/room-4-720x720.jpeg'),
('201', 'Family Room', 'Queen', 99.00, 4, 'available', 2, 'Large family room with two queen beds.', '/images/square-5.jpg'),
('202', 'Family Room', 'Queen', 99.00, 4, 'available', 2, 'Family room with garden view.', '/images/square-5.jpg'),
('203', 'Standard Room', 'Queen', 55.00, 2, 'available', 3, 'Standard queen room with city view.', '/images/square-4.jpg'),
('204', 'Standard Room', 'Queen', 55.00, 2, 'available', 3, 'Standard queen room with garden view.', '/images/square-4.jpg');

-- =============================================
-- 7. INSERT SAMPLE EMPLOYEES
-- =============================================
INSERT INTO employee (name, email, phone, job_title, department, salary, hire_date, payment_status) VALUES
('Snehal Varma', 'snehal.varma@hotel.com', '9876543210', 'Receptionist', 'Front Desk', 35000, '2026-06-01', 'pending'),
('Priya Sharma', 'priya.sharma@hotel.com', '9876543211', 'Senior Receptionist', 'Front Desk', 42000, '2025-12-15', 'pending'),
('Rajesh Kumar', 'rajesh.kumar@hotel.com', '9876543212', 'Front Office Manager', 'Front Desk', 55000, '2025-08-10', 'pending'),
('Anita Desai', 'anita.desai@hotel.com', '9876543213', 'Housekeeping Supervisor', 'Housekeeping', 32000, '2026-02-01', 'pending'),
('Vikram Singh', 'vikram.singh@hotel.com', '9876543216', 'Head Chef', 'Kitchen', 65000, '2025-06-01', 'pending');

-- =============================================
-- 8. INSERT SAMPLE DRIVERS
-- =============================================
INSERT INTO drivers (name, phone, car_model, car_number, availability, salary) VALUES
('Rajesh Driver', '9876543301', 'Toyota Innova', 'MH-01-AB-1234', 'available', 25000),
('Santosh Patil', '9876543302', 'Maruti Suzuki Ertiga', 'MH-02-CD-5678', 'available', 25000);

-- =============================================
-- 9. INSERT SAMPLE CUSTOMERS
-- =============================================
INSERT INTO customer (customer_id, name, email, phone, address, id_proof, id_proof_number) VALUES
('CUST001', 'John Doe', 'john@gmail.com', '9876543401', '123 Main St, Mumbai', 'Aadhar', '1234-5678-9012'),
('CUST002', 'Jane Smith', 'jane@gmail.com', '9876543402', '456 Park Ave, Pune', 'PAN', 'ABCDE1234F'),
('CUST003', 'Mike Johnson', 'mike@gmail.com', '9876543403', '789 Lake Rd, Delhi', 'Driving License', 'DL-123456-7890'),
('CUST004', 'Pragati Khot', 'khotpragati99@gmail.com', '9876543214', '456 Park Ave, Mumbai', 'Aadhar', '5678-9012-3456');

-- =============================================
-- 10. INSERT SAMPLE BOOKINGS
-- =============================================
INSERT INTO booking (booking_number, customer_id, room_id, check_in_date, check_out_date, total_nights, total_amount, status, payment_status, guests, special_requests) VALUES
('BK001', 1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 3, 267.00, 'confirmed', 'pending', 2, 'Extra pillows, early check-in requested'),
('BK002', 2, 3, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, 130.00, 'confirmed', 'pending', 2, 'Garden view requested');

-- =============================================
-- 11. FINAL VERIFICATION
-- =============================================
SELECT '=== USERS ===' as '';
SELECT id, username, email, full_name, role, is_active FROM login2;

SELECT '=== TOTAL ROOMS ===' as '';
SELECT COUNT(*) as total_rooms FROM rooms;

SELECT '=== TOTAL EMPLOYEES ===' as '';
SELECT COUNT(*) as total_employees FROM employee;

SELECT '=== TOTAL DRIVERS ===' as '';
SELECT COUNT(*) as total_drivers FROM drivers;

SELECT '=== TOTAL CUSTOMERS ===' as '';
SELECT COUNT(*) as total_customers FROM customer;

SELECT '=== TOTAL BOOKINGS ===' as '';
SELECT COUNT(*) as total_bookings FROM booking;

SELECT '✅ Database setup completed successfully!' as '';

SET SQL_SAFE_UPDATES = 1;