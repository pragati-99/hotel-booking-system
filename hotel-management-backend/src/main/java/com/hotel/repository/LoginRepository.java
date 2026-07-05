package com.hotel.repository;

import com.hotel.entity.Login;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginRepository extends JpaRepository<Login, Integer> {
    
    // ✅ Case-insensitive username search using Spring Data
    Optional<Login> findByUsernameIgnoreCase(String username);
    
    // ✅ Case-insensitive email search using Spring Data
    Optional<Login> findByEmailIgnoreCase(String email);
    
    // ✅ Combined search - Case insensitive
    Optional<Login> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);
    
    // ✅ Case-insensitive username search using JPQL
    @Query("SELECT l FROM Login l WHERE LOWER(l.username) = LOWER(:username)")
    Optional<Login> findUserByUsernameIgnoreCase(@Param("username") String username);
    
    // ✅ Case-insensitive email search using JPQL
    @Query("SELECT l FROM Login l WHERE LOWER(l.email) = LOWER(:email)")
    Optional<Login> findUserByEmailIgnoreCase(@Param("email") String email);
}