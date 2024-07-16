import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  uintCV,
  principalCV,
  responseOkCV,
  responseErrorCV,
  tupleCV,
  someCV,
  noneCV,
} from "@stacks/transactions";

// Hardcoded addresses from the simnet configuration
const DEPLOYER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const WALLET_1_ADDRESS = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

// Initialize the simnet
let simnet: any;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe("Rental Contract", () => {
  it("should create a rental agreement", async () => {
    const propertyId = uintCV(1);
    const tenant = principalCV(WALLET_1_ADDRESS);
    const rent = uintCV(1000);
    const duration = uintCV(30);

    // Mock get-property call to return a property owned by the deployer
    simnet.deployContract("RwaProperty", `(define-public (get-property (property-id uint)) (ok {owner: '${DEPLOYER_ADDRESS}', property-id: ${propertyId}}))`);

    // Create a rental agreement
    let block = simnet.mineBlock([
      tx.callPublicFn("rental-contract", "create-rental-agreement", [propertyId, tenant, rent, duration], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should pay rent", async () => {
    const propertyId = uintCV(1);

    // Pay rent
    let block = simnet.mineBlock([
      tx.callPublicFn("rental-contract", "pay-rent", [propertyId], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should not pay rent after agreement ends", async () => {
    const propertyId = uintCV(1);

    // Simulate block height to exceed rental agreement duration
    simnet.setBlockHeight(50);

    // Attempt to pay rent after agreement ends
    let block = simnet.mineBlock([
      tx.callPublicFn("rental-contract", "pay-rent", [propertyId], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(104)));
  });

  it("should terminate rental agreement by owner", async () => {
    const propertyId = uintCV(1);
    const tenant = principalCV(WALLET_1_ADDRESS);

    // Terminate rental agreement
    let block = simnet.mineBlock([
      tx.callPublicFn("rental-contract", "terminate-rental-agreement", [propertyId, tenant], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should not terminate rental agreement by non-owner", async () => {
    const propertyId = uintCV(1);
    const tenant = principalCV(WALLET_1_ADDRESS);

    // Attempt to terminate rental agreement by non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("rental-contract", "terminate-rental-agreement", [propertyId, tenant], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(102)));
  });
});
