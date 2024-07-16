import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  uintCV,
  principalCV,
  responseOkCV,
  responseErrorCV,
  boolCV,
  tupleCV,
  someCV,
  noneCV,
  ClarityValue,
} from "@stacks/transactions";

// Hardcoded addresses from the simnet configuration
const DEPLOYER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const WALLET_1_ADDRESS = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

// Initialize the simnet
let simnet: any;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe("Property Marketplace Contract", () => {
  it("should list a property for sale by the owner", async () => {
    const propertyId = uintCV(1);
    const price = uintCV(1000);

    // List the property for sale
    let block = simnet.mineBlock([
      tx.callPublicFn("property-marketplace", "list-property", [propertyId, price], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should not list a property for sale by non-owner", async () => {
    const propertyId = uintCV(1);
    const price = uintCV(1000);

    // Attempt to list the property for sale by non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("property-marketplace", "list-property", [propertyId, price], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(102)));
  });

  it("should buy a listed property", async () => {
    const propertyId = uintCV(1);

    // Buy the listed property
    let block = simnet.mineBlock([
      tx.callPublicFn("property-marketplace", "buy-property", [propertyId], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should not buy a non-listed property", async () => {
    const propertyId = uintCV(2);

    // Attempt to buy a non-listed property
    let block = simnet.mineBlock([
      tx.callPublicFn("property-marketplace", "buy-property", [propertyId], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(103)));
  });

  it("should cancel a property listing by the seller", async () => {
    const propertyId = uintCV(1);

    // Cancel the property listing
    let block = simnet.mineBlock([
      tx.callPublicFn("property-marketplace", "cancel-listing", [propertyId], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should not cancel a property listing by non-seller", async () => {
    const propertyId = uintCV(1);

    // Attempt to cancel the property listing by non-seller
    let block = simnet.mineBlock([
      tx.callPublicFn("property-marketplace", "cancel-listing", [propertyId], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(102)));
  });
});
