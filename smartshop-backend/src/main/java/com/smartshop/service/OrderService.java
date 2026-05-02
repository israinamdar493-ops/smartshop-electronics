package com.smartshop.service;

import com.smartshop.model.*;
import com.smartshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartService cartService;

    // ── PLACE ORDER ──
    // Converts cart items into a permanent order
    // @Transactional = all steps succeed or all roll back
    @Transactional
    public Order placeOrder(Long userId) {

        // Step 1: Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Step 2: Get all cart items for this user
        List<Cart> cartItems = cartRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException(
                    "Cart is empty — add products first");
        }

        // Step 3: Create new order
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setCreatedAt(LocalDateTime.now());

        // Step 4: Convert cart items to order items
        // Also calculate total amount
        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0.0;

        for (Cart cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());

            // Store current price at time of order
            double price = cartItem.getProduct().getPrice();
            orderItem.setPriceAtOrder(price);

            // Add to total: price × quantity
            total += price * cartItem.getQuantity();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);

        // Step 5: Save order to database
        Order savedOrder = orderRepository.save(order);

        // Step 6: Clear the cart
        cartService.clearCart(userId);

        return savedOrder;
    }

    // ── GET ORDER HISTORY ──
    public List<Order> getOrdersByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        return orderRepository
                .findByUserOrderByCreatedAtDesc(user);
    }
}