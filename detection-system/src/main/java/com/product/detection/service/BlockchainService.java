package com.product.detection.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class BlockchainService {

    private final Web3j web3j;
    private final Credentials credentials;

    @Value("${blockchain.contract.address}")
    private String contractAddress;

    public BlockchainService(@Value("${blockchain.rpc.url}") String rpcUrl, 
                             @Value("${blockchain.private-key}") String privateKey) {
        this.web3j = Web3j.build(new HttpService(rpcUrl));
        this.credentials = Credentials.create(privateKey);
    }

    /**
     * WRITES to the blockchain
     * This method sends a transaction and waits for it to be mined.
     */
    public String addProductToBlockchain(String id, String name, String manufacturer) throws Exception {
        // 1. Define the Solidity function we want to call
        Function function = new Function(
                "addProduct",
                Arrays.asList(new Utf8String(id), new Utf8String(name), new Utf8String(manufacturer)),
                Collections.emptyList()
        );

        String encodedFunction = FunctionEncoder.encode(function);
        
        // 2. Prepare the Transaction Manager
        RawTransactionManager transactionManager = new RawTransactionManager(web3j, credentials);
        
        // 3. Send the signed transaction to the network
        EthSendTransaction response = transactionManager.sendTransaction(
                DefaultGasProvider.GAS_PRICE,
                DefaultGasProvider.GAS_LIMIT,
                contractAddress,
                encodedFunction,
                BigInteger.ZERO
        );

        if (response.hasError()) {
            throw new RuntimeException("Blockchain Error: " + response.getError().getMessage());
        }

        String transactionHash = response.getTransactionHash();

        // 4. Polling Logic: Wait for the transaction to be included in a block
        TransactionReceipt receipt = null;
        int attempts = 0;
        while (attempts < 10) {
            Optional<TransactionReceipt> receiptOptional = web3j.ethGetTransactionReceipt(transactionHash)
                    .send()
                    .getTransactionReceipt();
            
            if (receiptOptional.isPresent()) {
                receipt = receiptOptional.get();
                break;
            }
            
            // Wait 1 second before trying again
            Thread.sleep(1000);
            attempts++;
        }

        if (receipt == null) {
            throw new RuntimeException("Transaction receipt not found after 10 seconds.");
        }

        if (!receipt.isStatusOK()) {
            throw new RuntimeException("Transaction failed on the blockchain (Check if ID already exists).");
        }

        return transactionHash;
    }

    /**
     * READS from the blockchain (No Gas Cost)
     * Queries the smart contract for product authenticity.
     */
    public List<Type> verifyProductFromBlockchain(String id) throws Exception {
        Function function = new Function(
                "verifyProduct",
                Collections.singletonList(new Utf8String(id)),
                Arrays.asList(
                    new TypeReference<Utf8String>() {}, // modelName
                    new TypeReference<Utf8String>() {}, // manufacturer
                    new TypeReference<Uint256>() {},    // timestamp
                    new TypeReference<Bool>() {}        // isAuthentic
                )
        );

        String encodedFunction = FunctionEncoder.encode(function);
        
        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST
        ).send();

        return FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
    }
}