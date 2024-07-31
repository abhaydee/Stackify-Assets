import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  uintCV,
  listCV,
  responseOkCV,
  responseErrorCV,
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

describe("Thetix Contract", () => {
  it("should allow the owner to mint thetix-USD tokens", async () => {
    // Mint thetix-USD tokens
    let block = simnet.mineBlock([
      tx.callPublicFn("thetix", "mint-thetix-USD", [], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should allow the owner to add a supported feed", async () => {
    const feedId = uintCV(1);

    // Add a supported feed
    let block = simnet.mineBlock([
      tx.callPublicFn("thetix", "add-supported-feed", [feedId], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should not allow non-owner to add a supported feed", async () => {
    const feedId = uintCV(1);

    // Attempt to add a supported feed by a non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("thetix", "add-supported-feed", [feedId], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(101)));
  });

  it("should allow the owner to set supported feeds", async () => {
    const feedIds = listCV([uintCV(1), uintCV(2)]);

    // Set supported feeds
    let block = simnet.mineBlock([
      tx.callPublicFn("thetix", "set-supported-feeds", [feedIds], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));
  });

  it("should not allow non-owner to set supported feeds", async () => {
    const feedIds = listCV([uintCV(1), uintCV(2)]);

    // Attempt to set supported feeds by a non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("thetix", "set-supported-feeds", [feedIds], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(101)));
  });

  it("should return the supported feed IDs", async () => {
    // Get supported feed IDs
    let readOnlyResult = simnet.callReadOnlyFn("thetix", "get-supported-feeds-ids", [], DEPLOYER_ADDRESS);
    expect(readOnlyResult.result).toEqual(responseOkCV(listCV([uintCV(1), uintCV(2)])));
  });
});
