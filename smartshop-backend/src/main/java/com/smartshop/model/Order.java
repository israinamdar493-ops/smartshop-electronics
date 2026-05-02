package com.smartshop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // One order has many order items
    // CascadeType.ALL = when order saved, items saved too
    // mappedBy = "order" tells JPA the Order field
    // in OrderItem class owns this relationship
    @OneToMany(mappedBy = "order",
            cascade = CascadeType.ALL,
            fetch = FetchType.EAGER)
    private List<OrderItem> items;

    @Column(nullable = false)
    private Double totalAmount;

    // PLACED → PROCESSING → SHIPPED → DELIVERED
    @Column(nullable = false)
    private String status = "PLACED";

    // Automatically set when order is created
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}