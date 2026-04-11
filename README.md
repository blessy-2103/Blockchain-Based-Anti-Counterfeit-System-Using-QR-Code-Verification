# BlockVerify: Decentralized Anti-Counterfeit System


![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Blockchain](https://img.shields.io/badge/blockchain-Ethereum-purple)
![Backend](https://img.shields.io/badge/backend-SpringBoot-green)
![Frontend](https://img.shields.io/badge/frontend-React-blue)

## Overview
BlockVerify is a full-stack blockchain-based system designed to prevent counterfeit products in supply chains. It uses the Ethereum blockchain to store tamper-proof product data and allows users to verify authenticity through QR code scanning.

The system ensures trust between manufacturers and consumers by providing real-time verification using decentralized technology.

## Features

### Immutable Product Records
All product details are stored on the blockchain, making them tamper-proof and secure from unauthorized changes.

### QR Code Verification
Each product is assigned a unique QR code. Users can scan the code to instantly verify whether the product is genuine or fake.

### Real-Time Validation
The system connects to the blockchain in real time to validate product authenticity and display accurate results.

### Hybrid Architecture
Combines blockchain with traditional backend systems to ensure both security and performance.

## Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- Lucide Icons  
- Html5-QRCode  

### Backend
- Spring Boot (Java 17)  
- Web3j  

### Blockchain
- Solidity  
- Hardhat  
- Ethers.js  

### Database
- MySQL  

## Project Structure
detection-system/
├── src/                  # Spring Boot backend source code  
├── product-frontend/     # React frontend application  
└── fake-product-system/  # Smart contracts and blockchain setup  

## Installation and Setup

### 1. Blockchain Setup
cd fake-product-system  
npm install  
npx hardhat node  

Deploy the smart contract:
npx hardhat ignition deploy ./ignition/modules/ProductRegistry.cjs --network localhost  

### 2. Backend Setup
Update the configuration in application.properties:

blockchain.contract.address=YOUR_CONTRACT_ADDRESS  
blockchain.rpc.url=http://127.0.0.1:8545  
spring.datasource.password=YOUR_MYSQL_PASSWORD  

Run the backend server:
mvn spring-boot:run  

### 3. Frontend Setup
cd product-frontend  
npm install  
npm start  

## How It Works

1. Manufacturer registers a product with serial number and model name  
2. System generates a unique QR code for the product  
3. User scans the QR code using the web application  
4. The system queries the blockchain and verifies authenticity  
5. Result is displayed as:
   - Authentic product (valid record found)
   - Fake product (no matching record)

## Use Cases
- Detection of counterfeit products  
- Supply chain transparency  
- Pharmaceutical product verification  
- Electronics and retail authentication  


