package com.hotel.service;

import com.hotel.entity.Login;
import com.hotel.repository.LoginRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class LoginService {
    private final LoginRepository loginRepository;

    public LoginService(LoginRepository loginRepository) {
        this.loginRepository = loginRepository;
    }

    // ✅ Case-insensitive username lookup
    public Login getLoginByUsername(String username) {
        if (username == null) return null;
        return loginRepository.findByUsernameIgnoreCase(username).orElse(null);
    }

    // ✅ Case-insensitive email lookup
    public Login getLoginByEmail(String email) {
        if (email == null || email.isEmpty()) return null;
        return loginRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    // ✅ Combined case-insensitive lookup
    public Login getLoginByUsernameOrEmail(String usernameOrEmail) {
        if (usernameOrEmail == null) return null;
        return loginRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(usernameOrEmail, usernameOrEmail).orElse(null);
    }

    public Login createLogin(Login login) {
        if (login.getCreatedAt() == null) {
            login.setCreatedAt(LocalDateTime.now());
        }
        login.setUpdatedAt(LocalDateTime.now());
        return loginRepository.save(login);
    }
}