package com.smartshop.repository;

import com.smartshop.model.Cart;
import com.smartshop.model.User;
import com.smartshop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository
        extends JpaRepository<Cart, Long> {

    // Get all cart items for a specific user
    List<Cart> findByUser(User user);

    // Check if product already in user's cart
    Optional<Cart> findByUserAndProduct(User user, Product product);

    // Delete all cart items for a user
    // Used when order is placed — clears the cart
    void deleteByUser(User user);
}