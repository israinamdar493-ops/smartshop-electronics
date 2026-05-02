package com.smartshop.controller;

import com.smartshop.dto.LoginResponse;
import com.smartshop.model.User;
import com.smartshop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // ── POST /api/users/register ──
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {
        try {
            User saved = userService.registerUser(user);

            LoginResponse response = new LoginResponse(
                    saved.getId(),
                    saved.getName(),
                    saved.getEmail(),
                    saved.getRole(),
                    "Registration successful"
            );
            // 201 CREATED
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException e) {
            // 400 BAD REQUEST — email already exists etc
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // ── POST /api/users/login ──
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> body) {
        try {
            String email    = body.get("email");
            String password = body.get("password");

            if (email == null || password == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email and password are required");
            }

            User user = userService.loginUser(email, password);

            LoginResponse response = new LoginResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    "Login successful"
            );
            // 200 OK
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // 401 UNAUTHORIZED — wrong credentials
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    // ── GET /api/users/{id} ──
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long id) {

        Optional<User> user = userService.getUserById(id);

        if (user.isPresent()) {
            User u = user.get();
            LoginResponse response = new LoginResponse(
                    u.getId(),
                    u.getName(),
                    u.getEmail(),
                    u.getRole(),
                    "User found"
            );
            return ResponseEntity.ok(response);
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("User not found");
    }
}