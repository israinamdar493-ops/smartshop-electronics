package com.smartshop.repository;

import com.smartshop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// @Repository tells Spring Boot:
// "This interface handles database operations"
@Repository

// JpaRepository<Product, Long> means:
// - We are working with the Product table
// - The primary key (id) type is Long
// You get 10+ free methods just by extending this
public interface ProductRepository extends JpaRepository<Product, Long> {

    // This method finds products by category
    // You do NOT write SQL — Spring reads the method name
    // and generates: SELECT * FROM products WHERE category = ?
    List<Product> findByCategory(String category);

    // Finds only active products
    // Generates: SELECT * FROM products WHERE active = true
    List<Product> findByActiveTrue();

    // Finds active products in a specific category
    // Generates: SELECT * FROM products WHERE category = ? AND active = true
    List<Product> findByCategoryAndActiveTrue(String category);

    // Search by name — LIKE query (for search bar)
    // %keyword% means: contains this word anywhere in the name
    // Generates: SELECT * FROM products WHERE name LIKE %?%
    List<Product> findByNameContainingIgnoreCase(String keyword);
}
