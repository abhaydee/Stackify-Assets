import { StacksMocknet } from "@stacks/network";
import {
    broadcastTransaction,
    AnchorMode,
    makeContractCall,
    stringAsciiCV,
    uintCV,
    listCV,
    getAddressFromPrivateKey,
    TransactionVersion,
    tupleCV,
} from '@stacks/transactions';

const key = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';
const address = getAddressFromPrivateKey(key, TransactionVersion.Testnet);
const network = new StacksMocknet();
const satoshiPerBTC = 100_000_000;
const updateInterval = 120_000; // Default 2 minutes

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Feed data
const feeds = [
    { name: 'US Dollar', ticker: 'USDT', price: 100_000_000, type: 'Crypto', impliedVolatility: Math.round(0.3 * satoshiPerBTC), pythFeedId: '2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b' },
    { name: 'Arbitrum', ticker: 'ARB', price: 0, type: 'Crypto', impliedVolatility: Math.round(14.3 * satoshiPerBTC), pythFeedId: '3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5' },
    { name: 'Avalanche', ticker: 'AVAX', price: 0, type: 'Crypto', impliedVolatility: Math.round(13.2 * satoshiPerBTC), pythFeedId: '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7' },
    { name: 'Binance Smart Chain', ticker: 'BNB', price: 0, type: 'Crypto', impliedVolatility: Math.round(6.23 * satoshiPerBTC), pythFeedId: '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f' },
    { name: 'Bitcoin', ticker: 'BTC', price: 0, type: 'Crypto', impliedVolatility: Math.round(2.5 * satoshiPerBTC), pythFeedId: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43' },
    { name: 'Chainlink', ticker: 'LINK', price: 0, type: 'Crypto', impliedVolatility: Math.round(11.5 * satoshiPerBTC), pythFeedId: '8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221' },
    { name: 'Dogecoin', ticker: 'DOGE', price: 0, type: 'Crypto', impliedVolatility: Math.round(7.55 * satoshiPerBTC), pythFeedId: 'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c' },
    { name: 'Ethereum', ticker: 'ETH', price: 0, type: 'Crypto', impliedVolatility: Math.round(3.44 * satoshiPerBTC), pythFeedId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace' },
    { name: 'Polygon', ticker: 'MATIC', price: 0, type: 'Crypto', impliedVolatility: Math.round(15.30 * satoshiPerBTC), pythFeedId: '5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52' },
    { name: 'XRP', ticker: 'XRP', price: 0, type: 'Crypto', impliedVolatility: Math.round(8.1 * satoshiPerBTC), pythFeedId: 'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8' },
];

// Fetch feed data off-chain and update feeds
const benchmarkBaseUrl = "https://benchmarks.pyth.network/v1/shims/tradingview/history";
const fetchRecentFeedData = async () => {
    try {
        for (const feed of feeds) {
            const symbol = `${feed.type}.${feed.ticker}/USD`;
            const now = Math.floor(Date.now() / 1000);
            const resolution = 1;
            const barCount = 1;
            const startTime = now - (resolution * barCount * 60);

            const pythUrl = `${benchmarkBaseUrl}?symbol=${symbol}&resolution=${resolution}&from=${startTime}&to=${now}`;
            const res = await fetch(pythUrl);
            if (!res.ok) throw new Error(`Error fetching feed data for ${symbol}`);
            const rawData = await res.json();
            feed.price = Math.ceil(satoshiPerBTC * rawData["c"][0]);
        }
    } catch (error) {
        console.error("Failed to fetch feed data:", error);
    }
};

const handleTransactionBroadcast = async (transaction, network) => {
    try {
        const broadcastResponse = await broadcastTransaction(transaction, network);
        const txId = broadcastResponse.txid;
        if (!txId) throw new Error("Transaction failed");
        console.log(`Transaction ID: ${txId}`);
        return txId;
    } catch (error) {
        console.error("Error broadcasting transaction:", error);
    }
};

const waitForTransactionConfirmation = async (txId, network) => {
    let retries = 10;
    while (retries > 0) {
        const txStatus = await fetch(`${network.coreApiUrl}/extended/v1/tx/${txId}`);
        const statusData = await txStatus.json();
        if (statusData.tx_status === 'success') {
            console.log("Transaction confirmed:", txId);
            return true;
        }
        await delay(10_000); // Retry every 10 seconds
        retries--;
    }
    console.log("Transaction not confirmed in time:", txId);
    return false;
};

const notifyUser = (message) => {
    console.log(`Notification: ${message}`);
};

const addFeeds = async () => {
    const nonceInfo = await fetch(`${network.coreApiUrl}/extended/v1/address/${address}/nonces`);
    const data = await nonceInfo.json();
    let nonce = data.possible_next_nonce;

    await fetchRecentFeedData();

    const txOptions = {
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName: 'mock-price-feed',
        functionName: 'add-feeds',
        functionArgs: [listCV(feeds.map(feed => tupleCV({
            "current-value": uintCV(Math.round(feed.price)),
            "ticker": stringAsciiCV(feed.ticker),
            "type": stringAsciiCV(feed.type),
            "name": stringAsciiCV(feed.name),
            "implied-volatility": uintCV(Math.round(feed.impliedVolatility)),
            "pyth-feed-id": stringAsciiCV(feed.pythFeedId),
        })))],
        senderKey: key,
        validateWithAbi: true,
        network,
        postConditions: [],
        anchorMode: AnchorMode.Any,
        nonce,
    };
    let transaction = await makeContractCall(txOptions);
    let txId = await handleTransactionBroadcast(transaction, network);
    if (txId) await waitForTransactionConfirmation(txId, network);
};

const addSupportedFeeds = async () => {
    const nonceInfo = await fetch(`${network.coreApiUrl}/extended/v1/address/${address}/nonces`);
    const data = await nonceInfo.json();
    let nonce = data.possible_next_nonce;

    const supportedFeeds = Array.from({ length: feeds.length }, (_, i) => uintCV(i));
    const txOptions = {
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName: 'bitthetix',
        functionName: 'set-supported-feeds',
        functionArgs: [listCV(supportedFeeds)],
        senderKey: key,
        validateWithAbi: true,
        network,
        postConditions: [],
        anchorMode: AnchorMode.Any,
        nonce,
    };
    let transaction = await makeContractCall(txOptions);
    let txId = await handleTransactionBroadcast(transaction, network);
    if (txId) await waitForTransactionConfirmation(txId, network);
};

const updateSupportedFeeds = async () => {
    const nonceInfo = await fetch(`${network.coreApiUrl}/extended/v1/address/${address}/nonces`);
    const data = await nonceInfo.json();
    let nonce = data.possible_next_nonce;

    await fetchRecentFeedData();

    const txOptions = {
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName: 'bitthetix',
        functionName: 'update-feeds',
        functionArgs: [listCV(feeds.map(feed => tupleCV({
            "current-value": uintCV(Math.round(feed.price)),
            "ticker": stringAsciiCV(feed.ticker),
            "type": stringAsciiCV(feed.type),
            "name": stringAsciiCV(feed.name),
            "implied-volatility": uintCV(Math.round(feed.impliedVolatility)),
            "pyth-feed-id": stringAsciiCV(feed.pythFeedId),
        })))],
        senderKey: key,
        validateWithAbi: true,
        network,
        postConditions: [],
        anchorMode: AnchorMode.Any,
        nonce,
    };
    let transaction = await makeContractCall(txOptions);
    let txId = await handleTransactionBroadcast(transaction, network);
    if (txId) await waitForTransactionConfirmation(txId, network);
};

// Start the update loop
const startFeedUpdateLoop = async () => {
    while (true) {
        await updateSupportedFeeds();
        notifyUser("Feed prices updated successfully.");
        await delay(updateInterval);
    }
};

startFeedUpdateLoop().catch(console.error);
