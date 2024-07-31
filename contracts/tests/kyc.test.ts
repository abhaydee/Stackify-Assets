import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeAll } from "vitest";
import {
  ClarityValue,
  principalCV,
  boolCV,
  ClarityType,
  uintCV,
} from "@stacks/transactions";

// Initialize the simnet
let simnet: any;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe("KYC Store", () => {
  let accounts: any;
  let deployer: any;
  let wallet_1: any;
  let wallet_2: any;

  beforeAll(() => {
    accounts = simnet.defaultAccounts;
    deployer = accounts.deployer;
    wallet_1 = accounts.wallet_1;
    wallet_2 = accounts.wallet_2;
  });

  it("should only allow owner to set KYC status", async () => {
    // Mine a block with a successful KYC status set by the owner
    let block = simnet.mineBlock([
      tx.callPublicFn(
        "kyc-store",
        "set-kyc-status",
        [principalCV(wallet_1.stxAddress), boolCV(true)],
        deployer.stxAddress
      ),
    ]);
    let result = block[0].result;
    expect(result).toEqual({ type: ClarityType.BoolTrue, value: true });

    // Verify the KYC status was set correctly
    let readOnlyResult = simnet.callReadOnlyFn(
      "kyc-store",
      "get-kyc-status",
      [principalCV(wallet_1.stxAddress)],
      deployer.stxAddress
    );
    expect(readOnlyResult.result).toEqual({ type: ClarityType.BoolTrue, value: true });

    // Attempt to set KYC status by a non-owner (should fail)
    block = simnet.mineBlock([
      tx.callPublicFn(
        "kyc-store",
        "set-kyc-status",
        [principalCV(wallet_1.stxAddress), boolCV(false)],
        wallet_1.stxAddress
      ),
    ]);
    result = block[0].result;
    expect(result).toEqual({ type: ClarityType.ResponseErr, value: uintCV(100) });

    // Verify the KYC status has not changed
    readOnlyResult = simnet.callReadOnlyFn(
      "kyc-store",
      "get-kyc-status",
      [principalCV(wallet_1.stxAddress)],
      deployer.stxAddress
    );
    expect(readOnlyResult.result).toEqual({ type: ClarityType.BoolTrue, value: true });
  });

  it("should return false for non-existent KYC entries", async () => {
    // Verify the KYC status is false for a non-existent entry
    let readOnlyResult = simnet.callReadOnlyFn(
      "kyc-store",
      "get-kyc-status",
      [principalCV(wallet_2.stxAddress)],
      deployer.stxAddress
    );
    expect(readOnlyResult.result).toEqual({ type: ClarityType.BoolFalse, value: false });
  });
});
