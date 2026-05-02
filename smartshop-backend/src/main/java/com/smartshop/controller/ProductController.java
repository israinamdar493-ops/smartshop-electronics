package com.smartshop.controller;

import com.smartshop.model.Product;
import com.smartshop.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// @RestController = @Controller + @ResponseBody
// Means: this class handles HTTP requests
// AND automatically converts Java objects to JSON
@RestController

// @RequestMapping sets the base URL for all methods in this class
// Every method URL starts with /api/products
@RequestMapping("/api/products")

// @CrossOrigin allows your HTML frontend to call this API
// Without this, browser blocks the request (CORS policy)
@CrossOrigin(origins = "*")
public class ProductController {

    // Spring automatically injects ProductService here
    @Autowired
    private ProductService productService;

    // ────────────────────────────────────────────────
    // GET /api/products
    // GET /api/products?category=Mobile
    // ────────────────────────────────────────────────
    // @GetMapping = this method handles GET requests
    // @RequestParam = reads ?category=Mobile from the URL
    // required = false means category is optional
    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category) {

        List<Product> products;

        if (category != null && !category.isEmpty()) {
            // URL had ?category=something
            // Return products filtered by that category
            products = productService.getProductsByCategory(category);
        } else {
            // No category in URL
            // Return all active products
            products = productService.getAllProducts();
        }

        // ResponseEntity.ok() = HTTP 200 status + data
        // HTTP 200 means: request was successful
        return ResponseEntity.ok(products);
    }

    // ────────────────────────────────────────────────
    // GET /api/products/search?keyword=samsung
    // ────────────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String keyword) {

        List<Product> results = productService.searchProducts(keyword);
        return ResponseEntity.ok(results);
    }

    // ────────────────────────────────────────────────
    // GET /api/products/1
    // ────────────────────────────────────────────────
    // @PathVariable = reads {id} from the URL itself
    // /api/products/1 → id = 1
    // /api/products/5 → id = 5
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id) {

        Optional<Product> product = productService.getProductById(id);

        if (product.isPresent()) {
            // Product found — return it with HTTP 200
            return ResponseEntity.ok(product.get());
        } else {
            // Product not found — return HTTP 404
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/products/1/recommendations
    // ────────────────────────────────────────────────
    // AI feature — returns similar products
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<Product>> getRecommendations(
            @PathVariable Long id) {

        List<Product> recommendations =
                productService.getRecommendations(id);
        return ResponseEntity.ok(recommendations);
    }

    // ────────────────────────────────────────────────
    // POST /api/products
    // Body: { "name":"...", "price":..., "category":"..." }
    // ────────────────────────────────────────────────
    // @PostMapping = handles POST requests
    // @RequestBody = reads the JSON body and converts to Product object
    @PostMapping
    public ResponseEntity<Product> addProduct(
            @RequestBody Product product) {

        Product saved = productService.addProduct(product);

        // HTTP 201 = Created (more specific than 200 for new data)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ────────────────────────────────────────────────
    // PUT /api/products/1
    // Body: { "name":"...", "price":..., ... }
    // ────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        Product updated = productService.updateProduct(id, product);

        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            // Product with that id does not exist
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // DELETE /api/products/1
    // ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id) {

        boolean deleted = productService.deleteProduct(id);

        if (deleted) {
            // HTTP 200 with a message
            return ResponseEntity.ok("Product deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}