import React, { useState } from 'react';
import { openContractCall, ContractCallOptions } from '@stacks/connect';
import { uintCV, stringAsciiCV } from '@stacks/transactions';
import { Button, Input, Form } from 'antd';

const PropertyManagement: React.FC = () => {
  const [propertyId, setPropertyId] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [docs, setDocs] = useState<string>('');
  const [priceInWei, setPriceInWei] = useState<number>(0);
  const [newOwner, setNewOwner] = useState<string>('');

  const handleCreateProperty = async () => {
    const options: ContractCallOptions = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'RwaProperty',
      functionName: 'create-property',
      functionArgs: [
        uintCV(propertyId),
        stringAsciiCV(name),
        stringAsciiCV(symbol),
        owner,
        stringAsciiCV(docs),
        uintCV(priceInWei),
      ],
      network: { chain: 'testnet' },
      onFinish: (response) => {
        console.log('Transaction response:', response);
      },
    };
    await openContractCall(options);
  };

  const handleTransferOwnership = async () => {
    const options: ContractCallOptions = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'RwaProperty',
      functionName: 'transfer-ownership',
      functionArgs: [uintCV(propertyId), newOwner],
      network: { chain: 'testnet' },
      onFinish: (response) => {
        console.log('Transaction response:', response);
      },
    };
    await openContractCall(options);
  };

  return (
    <div>
      <h2>Create Property</h2>
      <Form layout="vertical">
        <Form.Item label="Property ID">
          <Input type="number" onChange={(e) => setPropertyId(Number(e.target.value))} />
        </Form.Item>
        <Form.Item label="Name">
          <Input onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item label="Symbol">
          <Input onChange={(e) => setSymbol(e.target.value)} />
        </Form.Item>
        <Form.Item label="Owner">
          <Input onChange={(e) => setOwner(e.target.value)} />
        </Form.Item>
        <Form.Item label="Documents">
          <Input onChange={(e) => setDocs(e.target.value)} />
        </Form.Item>
        <Form.Item label="Price in Wei">
          <Input type="number" onChange={(e) => setPriceInWei(Number(e.target.value))} />
        </Form.Item>
        <Button type="primary" onClick={handleCreateProperty}>
          Create Property
        </Button>
      </Form>

      <h2>Transfer Ownership</h2>
      <Form layout="vertical">
        <Form.Item label="Property ID">
          <Input type="number" onChange={(e) => setPropertyId(Number(e.target.value))} />
        </Form.Item>
        <Form.Item label="New Owner">
          <Input onChange={(e) => setNewOwner(e.target.value)} />
        </Form.Item>
        <Button type="primary" onClick={handleTransferOwnership}>
          Transfer Ownership
        </Button>
      </Form>
    </div>
  );
};

export default PropertyManagement;