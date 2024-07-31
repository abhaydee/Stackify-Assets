import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  uintCV,
  bufferCV,
  listCV,
  responseOkCV,
  responseErrorCV,
  noneCV,
  someCV,
  boolCV,
  tupleCV
} from "@stacks/transactions";

// Hardcoded addresses from the simnet configuration
const DEPLOYER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

// Initialize the simnet
let simnet: any;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe("Stateless Bitcoin Verification Contract", () => {
  it("should allow inserting a burn header hash in debug mode", async () => {
    const headerHash = bufferCV(new Uint8Array(32));
    const burnHeight = uintCV(0);

    // Insert a burn header hash
    let block = simnet.mineBlock([
      tx.callPublicFn("stateless-btc-verification", "debug-insert-burn-header-hash", [headerHash, burnHeight], DEPLOYER_ADDRESS),
    ]);
    let result = block.receipts[0].result;
    expect(result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should verify a block header", async () => {
    const header = bufferCV(new Uint8Array(80));
    const expectedBlockHeight = uintCV(0);

    // Verify a block header
    let readOnlyResult = simnet.callReadOnlyFn("stateless-btc-verification", "verify-block-header", [header, expectedBlockHeight], DEPLOYER_ADDRESS);
    expect(readOnlyResult.result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should verify a Merkle proof", async () => {
    const reversedTxid = bufferCV(new Uint8Array(32));
    const merkleRoot = bufferCV(new Uint8Array(32));
    const proof = tupleCV({
      "tx-index": uintCV(0),
      "hashes": listCV([bufferCV(new Uint8Array(32))]),
    });

    // Verify a Merkle proof
    let readOnlyResult = simnet.callReadOnlyFn("stateless-btc-verification", "verify-merkle-proof", [reversedTxid, merkleRoot, proof], DEPLOYER_ADDRESS);
    expect(readOnlyResult.result).toEqual(responseOkCV(boolCV(true)));
  });

  it("should check if a txid was mined", async () => {
    const height = uintCV(0);
    const txid = bufferCV(new Uint8Array(32));
    const header = bufferCV(new Uint8Array(80));
    const proof = tupleCV({
      "tx-index": uintCV(0),
      "hashes": listCV([bufferCV(new Uint8Array(32))]),
    });

    // Check if a txid was mined
    let readOnlyResult = simnet.callReadOnlyFn("stateless-btc-verification", "was-txid-mined", [height, txid, header, proof], DEPLOYER_ADDRESS);
    expect(readOnlyResult.result).toEqual(responseOkCV(boolCV(true)));
  });
});
