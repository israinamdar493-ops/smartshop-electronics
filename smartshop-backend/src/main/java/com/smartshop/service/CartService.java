package com.smartshop.service;

import com.smartshop.model.Cart;
import com.smartshop.model.Product;
import com.smartshop.model.User;
import com.smartshop.repository.CartRepository;
import com.smartshop.repository.ProductRepository;
import com.smartshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // ── GET CART ITEMS FOR USER ──
    public List<Cart> getCartByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        return cartRepository.findByUser(user);
    }

    // ── ADD ITEM TO CART ──
    public Cart addToCart(Long userId,
                          Long productId,
                          Integer quantity) {

        // Step 1: Find user and product
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        // Step 2: Check if product already in cart
        Optional<Cart> existing =
                cartRepository.findByUserAndProduct(user, product);

        if (existing.isPresent()) {
            // Product already in cart — just increase quantity
            Cart cartItem = existing.get();
            cartItem.setQuantity(
                    cartItem.getQuantity() + quantity);
            return cartRepository.save(cartItem);
        }

        // Step 3: Product not in cart — add new cart item
        Cart newItem = new Cart();
        newItem.setUser(user);
        newItem.setProduct(product);
        newItem.setQuantity(quantity);
        return cartRepository.save(newItem);
    }

    // ── REMOVE ONE ITEM FROM CART ──
    public void removeFromCart(Long cartItemId) {
        cartRepository.deleteById(cartItemId);
    }

    // ── CLEAR ENTIRE CART ──
    // @Transactional = if anything fails, roll back all changes
    // Used after order is placed
    @Transactional
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        cartRepository.deleteByUser(user);
    }
}