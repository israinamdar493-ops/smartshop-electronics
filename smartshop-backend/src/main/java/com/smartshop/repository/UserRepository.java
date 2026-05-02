package com.smartshop.repository;

import com.smartshop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used during login to find user by email
    // Generates: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // Check if email already registered
    // Generates: SELECT EXISTS(...) WHERE email = ?
    boolean existsByEmail(String email);
}