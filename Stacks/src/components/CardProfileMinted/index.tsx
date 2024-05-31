import React, { memo } from 'react';
import { useAccount, useBalance } from 'wagmi';

import { ethToWei, sumCost } from '@/utils';

type TCardProfileMinted = {
  propertyCollection:
    | {
        maxSupply: number;
        propertryPrice: number;
      }
    | undefined;
};

const CardProfileMinted: React.FC<TCardProfileMinted> = ({
  propertyCollection,
}): JSX.Element => {
  const { address } = useAccount();
  const { data } = useBalance({ address });
  return (
    <>
      {propertyCollection && propertyCollection.propertryPrice && (
        <div className="flex flex-row text-small justify-between w-full mt-3">
          <p className="text-white">Property price:</p>
          <p className="text-white">
            {propertyCollection.propertryPrice / ethToWei} STX
          </p>
        </div>
      )}
      {propertyCollection && propertyCollection.maxSupply && (
        <div className="flex flex-row text-small justify-between w-full mt-3">
          <p className="text-white">Created tokens:</p>
          <p className="text-white">{propertyCollection.maxSupply}</p>
        </div>
      )}
      {propertyCollection &&
        propertyCollection.maxSupply &&
        propertyCollection.propertryPrice && (
          <div className="flex flex-row text-small justify-between w-full mt-3">
            <p className="text-white">Token price:</p>
            <p className="text-white">
              {sumCost(
                propertyCollection,
                String(propertyCollection.maxSupply),
              )}{' '}
              STX
            </p>
          </div>
        )}
    </>
  );
};

export default memo(CardProfileMinted);
