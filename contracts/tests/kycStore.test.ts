import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  uintCV,
  boolCV,
  principalCV,
  stringUtf8CV,
  bufferCV,
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

describe("KYC and Property Document Contract", () => {
  it("should allow the owner to set the KYC status of a person", async () => {
    const address = principalCV(WALLET_1_ADDRESS);
    const passed = boolCV(true);

    // Set the KYC status
    let block = simnet.mineBlock([
      tx.callPublicFn("kyc-property-contract", "set-kyc-status", [address, passed], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should not allow non-owner to set the KYC status of a person", async () => {
    const address = principalCV(WALLET_1_ADDRESS);
    const passed = boolCV(true);

    // Attempt to set the KYC status by a non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("kyc-property-contract", "set-kyc-status", [address, passed], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(100)));
  });

  it("should allow the owner to add a property document", async () => {
    const propertyId = bufferCV(new Uint8Array(32));
    const documentUri = stringUtf8CV("https://example.com/document");

    // Add a property document
    let block = simnet.mineBlock([
      tx.callPublicFn("kyc-property-contract", "add-property-document", [propertyId, documentUri], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should not allow non-owner to add a property document", async () => {
    const propertyId = bufferCV(new Uint8Array(32));
    const documentUri = stringUtf8CV("https://example.com/document");

    // Attempt to add a property document by a non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("kyc-property-contract", "add-property-document", [propertyId, documentUri], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(100)));
  });

  it("should allow the owner to add an authorized user", async () => {
    const address = principalCV(WALLET_1_ADDRESS);

    // Add an authorized user
    let block = simnet.mineBlock([
      tx.callPublicFn("kyc-property-contract", "add-authorized-user", [address], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should not allow non-owner to add an authorized user", async () => {
    const address = principalCV(WALLET_1_ADDRESS);

    // Attempt to add an authorized user by a non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("kyc-property-contract", "add-authorized-user", [address], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(100)));
  });
});
