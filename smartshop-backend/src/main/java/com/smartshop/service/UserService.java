package com.smartshop.service;

import com.smartshop.model.User;
import com.smartshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // BCryptPasswordEncoder handles password hashing
    // We create one instance and reuse it
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ── REGISTER ──
    public User registerUser(User user) {

        // Step 1: Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            // Throw exception — Controller will handle this
            throw new RuntimeException("Email already registered");
        }

        // Step 2: Hash the password before saving
        // NEVER save plain text password
        String hashedPassword =
                passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        // Step 3: Set default role as USER
        user.setRole("USER");

        // Step 4: Save to MySQL and return saved user
        return userRepository.save(user);
    }

    // ── LOGIN ──
    public User loginUser(String email, String password) {

        // Step 1: Find user by email
        Optional<User> userOptional =
                userRepository.findByEmail(email);

        // Step 2: Check if user exists
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Step 3: Compare typed password with stored hash
        // passwordEncoder.matches() does this comparison
        boolean passwordMatches =
                passwordEncoder.matches(password, user.getPassword());

        if (!passwordMatches) {
            throw new RuntimeException("Invalid password");
        }

        // Step 4: Login successful — return user
        return user;
    }

    // ── GET USER BY ID ──
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}