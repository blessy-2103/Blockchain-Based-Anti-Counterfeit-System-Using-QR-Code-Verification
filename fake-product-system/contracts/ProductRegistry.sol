// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// This library ensures only the Manufacturer can add new products
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductRegistry is Ownable {
    
    // This structure defines what data we store for each product
    struct Product {
        string modelName;
        string manufacturer;
        uint256 timestamp;
        bool isAuthentic;
    }

    // A mapping is like a database table. 
    // It maps a unique Product ID (from your QR code) to the Product details.
    mapping(bytes32 => Product) private products;

    // Events allow your Frontend (React) to listen for when a product is added
    event ProductAdded(bytes32 indexed productId, string modelName);

    // The constructor sets the person who deploys the contract as the "Owner"
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Adds a new product to the blockchain.
     * @param _id The unique serial number or ID from the QR code.
     * @param _modelName The name/model of the product.
     * @param _manufacturer The name of the making company.
     */
    function addProduct(string memory _id, string memory _modelName, string memory _manufacturer) public onlyOwner {
        // We hash the string ID into a bytes32 for efficient storage
        bytes32 productId = keccak256(abi.encodePacked(_id));
        
        // Ensure we don't overwrite an existing authentic product
        require(!products[productId].isAuthentic, "Product already exists in the system");

        products[productId] = Product({
            modelName: _modelName,
            manufacturer: _manufacturer,
            timestamp: block.timestamp,
            isAuthentic: true
        });

        emit ProductAdded(productId, _modelName);
    }

    /**
     * @dev Allows anyone to check if a product ID is real.
     * @param _id The unique ID scanned from the QR code.
     */
    function verifyProduct(string memory _id) public view returns (
        string memory modelName, 
        string memory manufacturer, 
        uint256 timestamp, 
        bool isAuthentic
    ) {
        bytes32 productId = keccak256(abi.encodePacked(_id));
        Product memory p = products[productId];
        
        // If it's not in our mapping, this will fail, flagging a fake
        require(p.isAuthentic, "Product not found or counterfeit!");
        
        return (p.modelName, p.manufacturer, p.timestamp, p.isAuthentic);
    }
}