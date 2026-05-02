package com.smartshop.repository;

import com.smartshop.model.Order;
import com.smartshop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository
        extends JpaRepository<Order, Long> {

    // Get all orders for a user — newest first
    List<Order> findByUserOrderByCreatedAtDesc(User user);
}