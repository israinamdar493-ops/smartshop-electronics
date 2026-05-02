package com.smartshop.config;

import com.smartshop.model.User;
import com.smartshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

// CommandLineRunner runs automatically when Spring Boot starts
// We use this to create the admin user with correct BCrypt password
@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {

        // Only create admin if it does not exist yet
        if (!userRepository.existsByEmail("admin@smartshop.com")) {

            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@smartshop.com");
            // BCrypt encode the password properly
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole("ADMIN");

            userRepository.save(admin);

            System.out.println("✅ Admin user created successfully");
            System.out.println("   Email: admin@smartshop.com");
            System.out.println("   Password: admin123");
            System.out.println("   Role: ADMIN");

        } else {
            System.out.println("✅ Admin user already exists");
        }
    }
}