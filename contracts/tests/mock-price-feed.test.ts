import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  uintCV,
  stringAsciiCV,
  tupleCV,
  responseOkCV,
  responseErrorCV,
  noneCV,
  someCV,
} from "@stacks/transactions";

// Hardcoded addresses from the simnet configuration
const DEPLOYER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const WALLET_1_ADDRESS = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

// Initialize the simnet
let simnet: any;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe("Mock Price Feed Contract", () => {
  it("should allow the owner to add a new feed", async () => {
    const feed = tupleCV({
      "current-value": uintCV(50000),
      ticker: stringAsciiCV("BTC"),
      type: stringAsciiCV("crypto"),
      name: stringAsciiCV("Bitcoin"),
      "implied-volatility": uintCV(5),
      "pyth-feed-id": stringAsciiCV("some-feed-id"),
    });

    // Add a new feed
    let block = simnet.mineBlock([
      tx.callPublicFn("mock-price-feed", "add-feed", [feed], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(noneCV()));

    // Verify the feed was added correctly
    let readOnlyResult = simnet.callReadOnlyFn("mock-price-feed", "get-feed", [uintCV(0)], DEPLOYER_ADDRESS);
    expect(readOnlyResult.result).toEqual(someCV(tupleCV({
      "current-value": uintCV(50000),
      ticker: stringAsciiCV("BTC"),
      type: stringAsciiCV("crypto"),
      name: stringAsciiCV("Bitcoin"),
      "implied-volatility": uintCV(5),
      "pyth-feed-id": stringAsciiCV("some-feed-id"),
      block: uintCV(block.height),
    })));
  });

  it("should not allow non-owner to add a new feed", async () => {
    const feed = tupleCV({
      "current-value": uintCV(50000),
      ticker: stringAsciiCV("BTC"),
      type: stringAsciiCV("crypto"),
      name: stringAsciiCV("Bitcoin"),
      "implied-volatility": uintCV(5),
      "pyth-feed-id": stringAsciiCV("some-feed-id"),
    });

    // Attempt to add a feed by a non-owner
    let block = simnet.mineBlock([
      tx.callPublicFn("mock-price-feed", "add-feed", [feed], WALLET_1_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseErrorCV(uintCV(100)));
  });
});
