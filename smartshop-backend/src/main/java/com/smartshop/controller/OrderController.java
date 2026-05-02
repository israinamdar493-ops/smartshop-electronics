package com.smartshop.controller;

import com.smartshop.model.Order;
import com.smartshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // POST /api/orders
    // Body: {"userId": 1}
    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @RequestBody Map<String, Long> body) {

        Long userId = body.get("userId");
        Order order = orderService.placeOrder(userId);
        return ResponseEntity.ok(order);
    }

    // GET /api/orders/{userId}
    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getOrders(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                orderService.getOrdersByUserId(userId));
    }
}