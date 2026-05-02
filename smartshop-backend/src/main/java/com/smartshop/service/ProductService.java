package com.smartshop.service;

import com.smartshop.model.Product;
import com.smartshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

// @Service tells Spring Boot:
// "This class contains business logic"
// Spring will automatically create one instance of this class
// and keep it ready to use anywhere in the project
@Service
public class ProductService {

    // @Autowired tells Spring Boot:
    // "Automatically give me an instance of ProductRepository"
    // You do NOT write: ProductRepository repo = new ProductRepository()
    // Spring does this for you — this is called Dependency Injection
    @Autowired
    private ProductRepository productRepository;

    // ── GET ALL PRODUCTS ──
    // Returns all products where active = true
    // Called when browser requests: GET /api/products
    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    // ── GET PRODUCTS BY CATEGORY ──
    // Returns products filtered by category
    // Called when browser requests: GET /api/products?category=Mobile
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category);
    }

    // ── GET SINGLE PRODUCT BY ID ──
    // Returns one product by its ID
    // Optional means: product might exist or might not
    // Called when browser requests: GET /api/products/1
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // ── SEARCH PRODUCTS ──
    // Returns products whose name contains the search keyword
    // Called when browser requests: GET /api/products/search?keyword=samsung
    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    // ── ADD NEW PRODUCT ──
    // Saves a new product to MySQL
    // Called when admin sends: POST /api/products
    public Product addProduct(Product product) {
        // Set active to true by default for new products
        product.setActive(true);
        return productRepository.save(product);
    }

    // ── UPDATE PRODUCT ──
    // Updates existing product in MySQL
    // Called when admin sends: PUT /api/products/1
    public Product updateProduct(Long id, Product updatedProduct) {

        // Step 1: Check if product exists
        Optional<Product> existing = productRepository.findById(id);

        if (existing.isPresent()) {

            // Step 2: Get the existing product object
            Product product = existing.get();

            // Step 3: Update only the fields that were sent
            product.setName(updatedProduct.getName());
            product.setDescription(updatedProduct.getDescription());
            product.setPrice(updatedProduct.getPrice());
            product.setCategory(updatedProduct.getCategory());
            product.setStock(updatedProduct.getStock());
            product.setImageUrl(updatedProduct.getImageUrl());

            // Step 4: Save and return updated product
            return productRepository.save(product);
        }

        // Product not found — return null
        // Controller will handle this and send 404 response
        return null;
    }

    // ── DELETE PRODUCT (Soft Delete) ──
    // Does NOT actually delete from database
    // Just sets active = false so it disappears from listings
    // Called when admin sends: DELETE /api/products/1
    public boolean deleteProduct(Long id) {
        Optional<Product> existing = productRepository.findById(id);

        if (existing.isPresent()) {
            Product product = existing.get();

            // Soft delete — set active to false
            // Product stays in database but is hidden from users
            product.setActive(false);
            productRepository.save(product);
            return true;
        }

        return false;
    }

    // ── AI RECOMMENDATION FEATURE ──
    // Returns other products in the same category
    // This is the simple AI logic — we build on this in Day 3
    // Called when browser requests: GET /api/products/1/recommendations
    public List<Product> getRecommendations(Long productId) {

        // Step 1: Find the product user is currently viewing
        Optional<Product> current = productRepository.findById(productId);

        if (current.isPresent()) {
            String category = current.get().getCategory();

            // Step 2: Find all other products in same category
            List<Product> recommendations =
                    productRepository.findByCategoryAndActiveTrue(category);

            // Step 3: Remove the current product from recommendations
            // We don't want to recommend the same product user is viewing
            recommendations.removeIf(p -> p.getId().equals(productId));

            return recommendations;
        }

        return List.of(); // return empty list if product not found
    }
}