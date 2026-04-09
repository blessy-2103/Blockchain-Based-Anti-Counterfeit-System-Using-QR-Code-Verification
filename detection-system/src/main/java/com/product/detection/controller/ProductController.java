package com.product.detection.controller;

import com.product.detection.model.Product;
import com.product.detection.repository.ProductRepository;
import com.product.detection.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.web3j.abi.datatypes.Type;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") 
public class ProductController {

    @Autowired
    private ProductRepository repository;

    @Autowired
    private BlockchainService blockchainService;

    // 1. ADD PRODUCT (POST)
    // URL: http://localhost:8080/api/products/add
    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        try {
            String txHash = blockchainService.addProductToBlockchain(
                product.getProductId(), 
                product.getName(), 
                product.getManufacturer()
            );

            product.setBlockchainHash(txHash);
            Product savedProduct = repository.save(product);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
            
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Blockchain Error: " + e.getMessage());
        }
    }

    // 2. VERIFY PRODUCT (GET)
    // URL: http://localhost:8080/api/products/verify/{id}
    @GetMapping("/verify/{id}")
    public ResponseEntity<?> verifyProduct(@PathVariable String id) {
        try {
            List<Type> blockchainData = blockchainService.verifyProductFromBlockchain(id);

            if (blockchainData.isEmpty() || !(boolean) blockchainData.get(3).getValue()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", "Not Found", "message", "Product not on blockchain."));
            }

            return ResponseEntity.ok(Map.of(
                "productId", id,
                "modelName", blockchainData.get(0).getValue().toString(),
                "manufacturer", blockchainData.get(1).getValue().toString(),
                "isAuthentic", (boolean) blockchainData.get(3).getValue()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed.");
        }
    }

    // 3. DEBUG ENDPOINT (GET)
    // URL: http://localhost:8080/api/products/status
    // If you visit this in your browser and it works, your 404 is fixed.
    @GetMapping("/status")
    public String checkStatus() {
        return "Backend Controller is Active and Mapped!";
    }
}