import { AddressType, BlockchainConstantsType } from '@/data/blockchain/types';

export const BlockchainConstants: BlockchainConstantsType = {
  '31': {
    kyc: '0x5984279eEfe0fEA8EBe45C56B4c63d651d938E57' as AddressType,
    arwaManager: '0xd91C043b269A84196B415BCA955889122f1b4d60' as AddressType,
  },
};

export enum PropertyStatus {
  Pending,
  Shipped,
  Accepted,
  Rejected,
  Canceled,
}

export const StatusToText: Record<PropertyStatus, string> = {
  [PropertyStatus.Pending]: 'Pending for approve',
  [PropertyStatus.Shipped]: 'Shipped',
  [PropertyStatus.Accepted]: 'Accepted accepted!',
  [PropertyStatus.Rejected]: 'Rejected property',
  [PropertyStatus.Canceled]: 'Canceled property',
};

export const AddressZero = '0x0000000000000000000000000000000000000000';
