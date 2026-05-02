package com.smartshop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// @Entity tells Spring Boot:
// "This class maps to a table in MySQL"
@Entity

// @Table tells Spring Boot which table name to use
@Table(name = "products")

// Lombok annotations — replaces 50+ lines of code:
// @Data         = generates all getters, setters, toString
// @NoArgsConstructor  = generates empty constructor Product()
// @AllArgsConstructor = generates Product(id, name, price...)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    // @Id = this is the primary key column
    // @GeneratedValue = MySQL auto-increments this number
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @Column maps this Java field to the MySQL column
    // nullable = false means this cannot be empty
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Integer stock;

    // image_url in MySQL becomes imageUrl in Java
    // Spring Boot handles this name conversion automatically
    private String imageUrl;

    // active column — true means product is visible
    @Column(nullable = false)
    private Boolean active = true;
}