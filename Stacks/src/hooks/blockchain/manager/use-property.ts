import { useCallback, useMemo } from 'react';
import { readContract, writeContract } from '@wagmi/core';
import { readContracts, useAccount, useNetwork } from 'wagmi';

import { AddressType, BlockchainConstants, PropertyType } from '@/data';
import { ArwaManagerAbi } from '@/data/abi/arwa-manager.abi';
import { ArwaPropertyAbi } from '@/data/abi/arwa-property.abi';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useProperty = () => {
  const account = useAccount();
  const { chain } = useNetwork();

  const createProperty = useCallback(
    // eslint-disable-next-line unicorn/prevent-abbreviations
    async (name: string, docs: string, symbol: string) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const { hash } = await writeContract({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        address: BlockchainConstants[String(chain?.id) || '31'].arwaManager,
        abi: ArwaManagerAbi,
        functionName: 'createPropertyRequest',
        account: account.address,
        args: [name, docs, symbol],
      });
      return hash;
    },
    [account],
  );

  const getPropertyInfo = useCallback(
    async (id: number) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const data = await readContract({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        address: BlockchainConstants[String(chain?.id) || '31'].arwaManager,
        abi: ArwaManagerAbi,
        functionName: 'getPropertyById',
        account: account.address,
        args: [id],
      });
      console.log('getPropertyInfo', { data });
      return data as PropertyType;
    },
    [account],
  );

  const mintTokens = useCallback(
    async (collectionAddress: AddressType, supply: number) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const { hash } = await writeContract({
        address: collectionAddress,
        abi: ArwaPropertyAbi,
        functionName: 'mint',
        account: account.address,
        args: [supply],
      });
      return hash;
    },
    [account],
  );

  const getPropertyCollectionInfo = useCallback(
    async (collectionAddress: AddressType) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const data = await readContracts({
        contracts: [
          {
            address: collectionAddress,
            abi: ArwaPropertyAbi,
            functionName: 'maxSupply',
          },
          {
            address: collectionAddress,
            abi: ArwaPropertyAbi,
            functionName: 'propertryPrice',
          },
        ],
      });
      console.log({ data });
      console.log(Number(data[1].result) / 10 ** 18);
      return {
        maxSupply: Number(data[0].result) as number,
        propertryPrice: Number(data[1].result) as number,
      };
    },
    [account],
  );

  return useMemo(
    () => ({
      createProperty,
      getPropertyInfo,
      mintTokens,
      getPropertyCollectionInfo,
    }),
    [account],
  );
};
