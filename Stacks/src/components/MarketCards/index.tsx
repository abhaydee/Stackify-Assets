import { memo, useEffect, useState } from 'react';
import { Card, CardBody, CardFooter } from '@nextui-org/card';
import { openContractCall, UserSession, AppConfig } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  trueCV,
} from '@stacks/transactions';
import Carousel from '../Carousel';
import styles from './styles.module.scss';

const appConfig = new AppConfig();
const userSession = new UserSession({ appConfig });

const MarketCards = () => {
  const [listings, setListings] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [newPrice, setNewPrice] = useState(0);
  const [additionalBlocks, setAdditionalBlocks] = useState(0);

  useEffect(() => {
    // Fetch active listings
    fetchActiveListings();
  }, []);

  const fetchActiveListings = async () => {
    // Call the get-active-listings function from the contract
    const response = await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'property-marketplace',
      functionName: 'get-active-listings',
      functionArgs: [],
      network: 'testnet',
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    });
    setListings(response.value);
  };

  const handleUpdatePrice = async (propertyId, newPrice) => {
    await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'property-marketplace',
      functionName: 'update-price',
      functionArgs: [uintCV(propertyId), uintCV(newPrice)],
      network: 'testnet',
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    });
    fetchActiveListings();
  };

  const handleExtendExpiration = async (propertyId, additionalBlocks) => {
    await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'property-marketplace',
      functionName: 'extend-expiration',
      functionArgs: [uintCV(propertyId), uintCV(additionalBlocks)],
      network: 'testnet',
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    });
    fetchActiveListings();
  };

  const handleViewListingDetails = async (propertyId) => {
    const response = await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'property-marketplace',
      functionName: 'get-listing',
      functionArgs: [uintCV(propertyId)],
      network: 'testnet',
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    });
    setSelectedProperty(response.value);
  };

  return (
    <div className={styles.marketCards}>
      <Carousel>
        {listings.map((listing) => (
          <Card key={listing.propertyId}>
            <CardBody>
              <h3>Property ID: {listing.propertyId}</h3>
              <p>Price: {listing.price}</p>
              <p>Status: {listing.status ? 'Active' : 'Inactive'}</p>
              <p>Expiration: {listing.expiration}</p>
            </CardBody>
            <CardFooter>
              <button onClick={() => handleViewListingDetails(listing.propertyId)}>View Details</button>
              <button onClick={() => handleUpdatePrice(listing.propertyId, newPrice)}>Update Price</button>
              <button onClick={() => handleExtendExpiration(listing.propertyId, additionalBlocks)}>Extend Expiration</button>
            </CardFooter>
          </Card>
        ))}
      </Carousel>
      {selectedProperty && (
        <div className={styles.propertyDetails}>
          <h3>Property Details</h3>
          <p>Property ID: {selectedProperty.propertyId}</p>
          <p>Price: {selectedProperty.price}</p>
          <p>Status: {selectedProperty.status ? 'Active' : 'Inactive'}</p>
          <p>Expiration: {selectedProperty.expiration}</p>
        </div>
      )}
    </div>
  );
};

export default memo(MarketCards);