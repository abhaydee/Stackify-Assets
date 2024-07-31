import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  uintCV,
  principalCV,
  responseOkCV,
  responseErrorCV,
  someCV,
  noneCV,
  boolCV,
  tupleCV,
} from "@stacks/transactions";

// Hardcoded addresses from the simnet configuration
const DEPLOYER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const BUYER_ADDRESS = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
const SELLER_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

// Initialize the simnet
let simnet: any;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe("Escrow Contract", () => {
  it("should initiate an escrow", async () => {
    const transactionId = uintCV(1);
    const buyer = principalCV(BUYER_ADDRESS);
    const seller = principalCV(SELLER_ADDRESS);
    const amount = uintCV(1000);

    // Initiate escrow
    let block = simnet.mineBlock([
      tx.callPublicFn("escrow-contract", "initiate-escrow", [transactionId, buyer, seller, amount], BUYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should not initiate an escrow by non-buyer", async () => {
    const transactionId = uintCV(1);
    const buyer = principalCV(BUYER_ADDRESS);
    const seller = principalCV(SELLER_ADDRESS);
    const amount = uintCV(1000);

    // Attempt to initiate escrow by non-buyer
    let block = simnet.mineBlock([
      tx.callPublicFn("escrow-contract", "initiate-escrow", [transactionId, buyer, seller, amount], SELLER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(102)));
  });

  it("should release funds from escrow by owner", async () => {
    const transactionId = uintCV(1);

    // Release funds from escrow
    let block = simnet.mineBlock([
      tx.callPublicFn("escrow-contract", "release-funds", [transactionId], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));

    // Verify escrow status is updated
    let readOnlyResult = simnet.callReadOnlyFn("escrow-contract", "get-escrow-status", [transactionId], DEPLOYER_ADDRESS);
    expect(readOnlyResult.result).toEqual(someCV(tupleCV({
      buyer: principalCV(BUYER_ADDRESS),
      seller: principalCV(SELLER_ADDRESS),
      amount: uintCV(1000),
      status: boolCV(true)
    })));
  });

  it("should not release funds from escrow by non-owner", async () => {
    const transactionId = uintCV(1);

    // Attempt to release funds from escrow by non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("escrow-contract", "release-funds", [transactionId], BUYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(102)));
  });
});
