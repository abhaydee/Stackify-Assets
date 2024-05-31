import { Abi } from 'viem';

export const ArwaManagerAbi: Abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'propertyId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'priceInWei',
        type: 'uint256',
      },
    ],
    name: 'createPropertyCollection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'docs',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
    ],
    name: 'createPropertyRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_propertyItemAddress',
        type: 'address',
      },
    ],
    name: 'setLibraryAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_kycManager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_propertyItemAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'propertyId',
        type: 'uint256',
      },
      {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        internalType: 'enum ArwaManager.Status',
        name: 'status',
        type: 'uint8',
      },
    ],
    name: 'updatePropertyState',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'docs',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'enum ArwaManager.Status',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'collectionAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address',
          },
        ],
        internalType: 'struct ArwaManager.Property',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'verifierAddress',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'state',
        type: 'bool',
      },
    ],
    name: 'updateVerifier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAvailableVerifierProperties',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'docs',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'enum ArwaManager.Status',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'collectionAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address',
          },
        ],
        internalType: 'struct ArwaManager.Property[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getPropertyById',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'docs',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'enum ArwaManager.Status',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'collectionAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address',
          },
        ],
        internalType: 'struct ArwaManager.Property',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'kycManager',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'properties',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'docs',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'enum ArwaManager.Status',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'collectionAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'userProperties',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'docs',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'enum ArwaManager.Status',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'collectionAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address',
          },
        ],
        internalType: 'struct ArwaManager.Property[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'verifier',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
