import React, { useState, useEffect } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, standardPrincipalCV } from '@stacks/transactions';
import { Button, Input, Form, Card, message, Spin } from 'antd';
import { useSTXAddress } from '@stacks/connect-react';

interface Listing {
  seller: string;
  price: number;
  status: boolean;
  expiration: number;
  createdAt: number;
}

const MarketplaceOperations: React.FC = () => {
  const [propertyId, setPropertyId] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentListing, setCurrentListing] = useState<Listing | null>(null);
  const stxAddress = useSTXAddress();

  const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

  const handleListProperty = async () => {
    try {
      setLoading(true);
      const options = {
        contractAddress,
        contractName: 'PropertyMarketPlace',
        functionName: 'list-property',
        functionArgs: [uintCV(propertyId), uintCV(price)],
        network: 'testnet',
        onFinish: (data: any) => {
          message.success('Property listed successfully!');
          console.log('Transaction:', data);
        },
      };
      await openContractCall(options);
    } catch (e) {
      message.error('Failed to list property');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyProperty = async () => {
    try {
      setLoading(true);
      const options = {
        contractAddress,
        contractName: 'PropertyMarketPlace',
        functionName: 'buy-property',
        functionArgs: [uintCV(propertyId)],
        network: 'testnet',
        onFinish: (data: any) => {
          message.success('Property purchased successfully!');
          console.log('Transaction:', data);
        },
      };
      await openContractCall(options);
    } catch (e) {
      message.error('Failed to purchase property');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Spin spinning={loading}>
        <Card title="Property Marketplace" bordered={false}>
          <Form layout="vertical">
            <Form.Item label="Property ID">
              <Input
                type="number"
                value={propertyId}
                onChange={(e) => setPropertyId(Number(e.target.value))}
              />
            </Form.Item>

            <Form.Item label="Price (in STX)">
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={handleListProperty} style={{ marginRight: '10px' }}>
                List Property
              </Button>
              <Button onClick={handleBuyProperty}>Buy Property</Button>
            </Form.Item>
          </Form>
        </Card>

        {currentListing && (
          <Card title="Current Listing" style={{ marginTop: '20px' }}>
            <p>Seller: {currentListing.seller}</p>
            <p>Price: {currentListing.price} STX</p>
            <p>Status: {currentListing.status ? 'Active' : 'Inactive'}</p>
            <p>Expiration: Block #{currentListing.expiration}</p>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default MarketplaceOperations; 