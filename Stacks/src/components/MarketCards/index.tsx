// MarketCards.tsx
import { memo, useEffect, useState } from 'react';
import { Card, CardBody, CardFooter } from '@nextui-org/card';
import { openContractCall, UserSession, AppConfig } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  principalCV,
  standardPrincipalCV,
  trueCV,
} from '@stacks/transactions';
import Carousel from '../Carousel';
import styles from './styles.module.scss';

const appConfig = new AppConfig();
const userSession = new UserSession({ appConfig });

const MarketCards = (): JSX.Element => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const images = [
    'https://images.unsplash.com/photo-1530734218972-25a9391ccd8b?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://img.freepik.com/free-photo/modern-residential-district-with-green-roof-balcony-generated-by-ai_188544-10276.jpg?size=626&ext=jpg&ga=GA1.2.663633836.1697379764&semt=ais',
  ];

  const handleListProperty = async (propertyId: number, price: number) => {
    const transaction = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with your contract address
      contractName: 'property-marketplace',
      functionName: 'list-property',
      functionArgs: [uintCV(propertyId), uintCV(price)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    };

    await openContractCall(transaction);
  };

  const handleBuyProperty = async (propertyId: number) => {
    const transaction = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with your contract address
      contractName: 'property-marketplace',
      functionName: 'buy-property',
      functionArgs: [uintCV(propertyId)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    };

    await openContractCall(transaction);
  };

  const handleCancelListing = async (propertyId: number) => {
    const transaction = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with your contract address
      contractName: 'property-marketplace',
      functionName: 'cancel-listing',
      functionArgs: [uintCV(propertyId)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    };

    await openContractCall(transaction);
  };

  return (
    <div className="gap-3 grid grid-cols-1">
      {isClient && (
        <>
          {[...Array.from({ length: 2 }).keys()].map((_, index) => (
            <Card shadow="sm" key={index} className={styles.cardContainer}>
              <div className="flex flex-col sm:flex-row">
                <CardBody className="rounded-2xl overflow-visible shadow-lg  w-full sm:w-1/2">
                  <Carousel images={images} />
                </CardBody>
                <CardFooter className="flex-col items-start gap-4 w-1/2 p-4">
                  <div>
                    <p className="text-default-500 text-xl">Karra Loft 3A</p>
                    <p className="text-default-500 text-sm">Indonesia, Bali</p>
                  </div>
                  <div>
                    <p className="text-default-500 text-xl">Object Price</p>
                    <p className="text-white">$220,000</p>
                  </div>
                  <div>
                    <p className="text-default-500 text-xl">Token Price</p>
                    <p className="text-white">$50</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleListProperty(index, 220000)}>
                      List Property
                    </button>
                    <button onClick={() => handleBuyProperty(index)}>
                      Buy Property
                    </button>
                    <button onClick={() => handleCancelListing(index)}>
                      Cancel Listing
                    </button>
                  </div>
                </CardFooter>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default memo(MarketCards);