package com.smartshop.controller;

import com.smartshop.model.Cart;
import com.smartshop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    // GET /api/cart/{userId}
    @GetMapping("/{userId}")
    public ResponseEntity<List<Cart>> getCart(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                cartService.getCartByUserId(userId));
    }

    // POST /api/cart
    // Body: {"userId":1, "productId":3, "quantity":2}
    @PostMapping
    public ResponseEntity<?> addToCart(
            @RequestBody Map<String, Object> body) {
        try {
            Long userId    = Long.valueOf(body.get("userId").toString());
            Long productId = Long.valueOf(body.get("productId").toString());
            Integer qty    = Integer.valueOf(body.get("quantity").toString());

            Cart item = cartService.addToCart(userId, productId, qty);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/cart/{cartItemId}
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<String> removeItem(
            @PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.ok("Item removed");
    }

    // DELETE /api/cart/clear/{userId}
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<String> clearCart(
            @PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared");
    }
}