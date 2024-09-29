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
const WALLET_2_ADDRESS = "ST2J3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD6"; // another test wallet

// Initialize the simnet
let simnet: any;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe("Property Contract Test Suite", () => {
  // Test case: Create a new property
  it("should allow the deployer to create a new property", async () => {
    const propertyId = uintCV(1);
    const propertyName = "Test Property";
    const propertySymbol = "TP";
    const propertyOwner = principalCV(DEPLOYER_ADDRESS);
    const propertyDocs = "Property Documents";
    const priceInWei = uintCV(1000);

    const receipt = await tx(
      simnet,
      DEPLOYER_ADDRESS,
      "contract-address.create-property",
      [propertyId, propertyName, propertySymbol, propertyOwner, propertyDocs, priceInWei]
    );

    expect(receipt.success).toBe(true);
    expect(receipt.result).toEqual(responseOkCV(boolCV(true)));
  });

  // Test case: Transfer ownership of a property
  it("should allow the property owner to transfer ownership", async () => {
    const propertyId = uintCV(1);
    const newOwner = principalCV(WALLET_1_ADDRESS);

    const receipt = await tx(
      simnet,
      DEPLOYER_ADDRESS,
      "contract-address.transfer-ownership",
      [propertyId, newOwner]
    );

    expect(receipt.success).toBe(true);
    expect(receipt.result).toEqual(responseOkCV(boolCV(true)));

    // Check if the owner is updated to WALLET_1
    const property = await tx(
      simnet,
      DEPLOYER_ADDRESS,
      "contract-address.get-property",
      [propertyId]
    );
    expect(property.success).toBe(true);
    const propertyData = tupleCV({
      owner: principalCV(WALLET_1_ADDRESS),
    });
    expect(property.result).toEqual(someCV(propertyData));
  });

  // Test case: Prevent non-owners from transferring ownership
  it("should prevent a non-owner from transferring ownership", async () => {
    const propertyId = uintCV(1);
    const newOwner = principalCV(WALLET_2_ADDRESS);

    const receipt = await tx(
      simnet,
      WALLET_1_ADDRESS, // Wallet_1 is now the owner, so this should fail
      "contract-address.transfer-ownership",
      [propertyId, newOwner]
    );

    expect(receipt.success).toBe(false);
    expect(receipt.result).toEqual(responseErrorCV(uintCV(105))); // Error: not the owner
  });

  // Test case: Create a rental agreement
  it("should allow the owner to create a rental agreement", async () => {
    const propertyId = uintCV(1);
    const tenant = principalCV(WALLET_2_ADDRESS);
    const rentAmount = uintCV(500);
    const duration = uintCV(30); // duration in blocks

    const receipt = await tx(
      simnet,
      WALLET_1_ADDRESS, // WALLET_1 is now the property owner
      "contract-address.create-rental-agreement",
      [propertyId, tenant, rentAmount, duration]
    );

    expect(receipt.success).toBe(true);
    expect(receipt.result).toEqual(responseOkCV(boolCV(true)));

    // Verify the rental agreement
    const rentalAgreement = await tx(
      simnet,
      WALLET_1_ADDRESS,
      "contract-address.get-rental-agreement",
      [propertyId]
    );
    expect(rentalAgreement.success).toBe(true);
    const rentalData = tupleCV({
      tenant: principalCV(WALLET_2_ADDRESS),
      rent: rentAmount,
      start_time: uintCV(await simnet.blockHeight()),
      end_time: uintCV((await simnet.blockHeight()) + 30),
    });
    expect(rentalAgreement.result).toEqual(someCV(rentalData));
  });

  // Test case: Pay verification fee
  it("should allow a user to pay the verification fee", async () => {
    const propertyId = uintCV(1);

    const receipt = await tx(
      simnet,
      WALLET_2_ADDRESS, // Assuming WALLET_2 is the one paying the fee
      "contract-address.pay-verification-fee",
      [propertyId]
    );

    expect(receipt.success).toBe(true);
    expect(receipt.result).toEqual(responseOkCV(boolCV(true)));
  });

  // Test case: Prevent fee payment if balance is too low
  it("should prevent fee payment if user balance is too low", async () => {
    const propertyId = uintCV(1);

    // Setting a high verification fee for the test
    await tx(
      simnet,
      DEPLOYER_ADDRESS,
      "contract-address.set-verification-fee",
      [uintCV(100000)] // High fee
    );

    const receipt = await tx(
      simnet,
      WALLET_2_ADDRESS, // WALLET_2 may not have enough balance
      "contract-address.pay-verification-fee",
      [propertyId]
    );

    expect(receipt.success).toBe(false);
    expect(receipt.result).toEqual(responseErrorCV(uintCV(106))); // Error: insufficient balance
  });
});
