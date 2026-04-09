package com.product.detection;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.product.detection") // <--- ADD THIS LINE
public class DetectionSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(DetectionSystemApplication.class, args);
    }
}