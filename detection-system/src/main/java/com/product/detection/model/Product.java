package com.product.detection.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String productId; // This matches the ID in your QR code
    private String name;
    private String manufacturer;
    private String blockchainHash; // We'll store the transaction hash here for proof
}