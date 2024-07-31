import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  uintCV,
  principalCV,
  bufferCV,
  noneCV,
  responseOkCV,
  responseErrorCV,
} from "@stacks/transactions";

// Hardcoded addresses from the simnet configuration
const DEPLOYER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const WALLET_1_ADDRESS = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

// Initialize the simnet
let simnet: any;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe("sBTC Contract", () => {
  it("should allow the owner to set a new contract owner", async () => {
    // Set a new contract owner
    let block = simnet.mineBlock([
      tx.callPublicFn("sbct", "set-contract-owner", [principalCV(WALLET_1_ADDRESS)], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should not allow non-owner to set a new contract owner", async () => {
    // Attempt to set a new contract owner by a non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("sbct", "set-contract-owner", [principalCV(WALLET_1_ADDRESS)], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(403)));
  });

  it("should allow the owner to mint sBTC tokens", async () => {
    // Mint sBTC tokens
    let block = simnet.mineBlock([
      tx.callPublicFn("sbct", "mint-bitthetix-testnet", [], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should allow the owner to transfer sBTC tokens", async () => {
    const amount = uintCV(100000000); // 1 sBTC

    // Transfer sBTC tokens from the owner to another wallet
    let block = simnet.mineBlock([
      tx.callPublicFn("sbct", "transfer", [amount, principalCV(DEPLOYER_ADDRESS), principalCV(WALLET_1_ADDRESS), noneCV()], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should not allow non-owner to transfer sBTC tokens", async () => {
    const amount = uintCV(100000000); // 1 sBTC

    // Attempt to transfer sBTC tokens from a non-owner wallet
    let block = simnet.mineBlock([
      tx.callPublicFn("sbct", "transfer", [amount, principalCV(WALLET_1_ADDRESS), principalCV(DEPLOYER_ADDRESS), noneCV()], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(4)));
  });
});
