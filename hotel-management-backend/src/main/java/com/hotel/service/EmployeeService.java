package com.hotel.service;

import com.hotel.entity.Employee;
import com.hotel.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Integer id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));
    }

    public List<Employee> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department);
    }

    public List<Employee> getManagers() {
        return employeeRepository.findByJobTitle("Manager");
    }

    public List<Employee> searchEmployees(String keyword) {
        return employeeRepository.findByNameContainingIgnoreCase(keyword);
    }

    public Employee createEmployee(Employee employee) {
        employee.setCreatedAt(LocalDateTime.now());
        // Default payment status
        if (employee.getPaymentStatus() == null) {
            employee.setPaymentStatus("pending");
        }
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Integer id, Employee employeeDetails) {
        Employee employee = getEmployeeById(id);
        employee.setName(employeeDetails.getName());
        employee.setEmail(employeeDetails.getEmail());
        employee.setPhone(employeeDetails.getPhone());
        employee.setJobTitle(employeeDetails.getJobTitle());
        employee.setDepartment(employeeDetails.getDepartment());
        employee.setSalary(employeeDetails.getSalary());
        employee.setHireDate(employeeDetails.getHireDate());
        employee.setAddress(employeeDetails.getAddress());
        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Integer id) {
        employeeRepository.deleteById(id);
    }

    // ✅ Update payment status
    public Employee updatePaymentStatus(Integer id, String paymentStatus) {
        Employee employee = getEmployeeById(id);
        employee.setPaymentStatus(paymentStatus);
        return employeeRepository.save(employee);
    }

    // ✅ Get payment statistics
    public Map<String, Object> getPaymentStats() {
        List<Employee> employees = employeeRepository.findAll();
        
        // Total salary
        BigDecimal totalSalary = employees.stream()
                .map(Employee::getSalary)
                .filter(s -> s != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Average salary
        BigDecimal avgSalary = employees.isEmpty() ? BigDecimal.ZERO : 
                totalSalary.divide(BigDecimal.valueOf(employees.size()), 2, java.math.RoundingMode.HALF_UP);
        
        // Paid this month
        BigDecimal paidThisMonth = employees.stream()
                .filter(e -> "paid".equals(e.getPaymentStatus()))
                .map(Employee::getSalary)
                .filter(s -> s != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Pending salary
        BigDecimal pendingSalary = employees.stream()
                .filter(e -> "pending".equals(e.getPaymentStatus()) || e.getPaymentStatus() == null)
                .map(Employee::getSalary)
                .filter(s -> s != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Department counts
        Map<String, Long> departmentCounts = employees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", employees.size());
        stats.put("totalSalary", totalSalary);
        stats.put("averageSalary", avgSalary);
        stats.put("paidThisMonth", paidThisMonth);
        stats.put("pendingSalary", pendingSalary);
        stats.put("departmentCounts", departmentCounts);
        
        return stats;
    }
}