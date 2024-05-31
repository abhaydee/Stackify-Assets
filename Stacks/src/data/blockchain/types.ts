import { PropertyStatus } from '@/data';

export type AddressType = `0x${string}`;

export type BlockchainConstantsType = {

  31: {
    kyc: AddressType;
    arwaManager: AddressType;
  };
};

export type PropertyType = {
  id: number;
  name: string;
  docs: string;
  symbol: string;
  owner: AddressType;
  status: PropertyStatus;
  collectionAddress: AddressType;
  verifier: AddressType;
};
