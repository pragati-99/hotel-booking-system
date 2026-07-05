package com.hotel.repository;

import com.hotel.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    List<Employee> findByJobTitle(String jobTitle);
    List<Employee> findByDepartment(String department);
    List<Employee> findByNameContainingIgnoreCase(String name);
    List<Employee> findByPaymentStatus(String paymentStatus);
    
    @Query("SELECT e FROM Employee e WHERE e.department = :department AND e.jobTitle = :jobTitle")
    List<Employee> findByDepartmentAndJobTitle(String department, String jobTitle);
}