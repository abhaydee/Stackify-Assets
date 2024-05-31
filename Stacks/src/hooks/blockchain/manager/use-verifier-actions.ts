import { useCallback, useMemo } from 'react';
import { writeContract } from '@wagmi/core';
import { useAccount, useNetwork } from 'wagmi';

import { BlockchainConstants, PropertyStatus } from '@/data';
import { ArwaManagerAbi } from '@/data/abi/arwa-manager.abi';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useVerifierActions = () => {
  const account = useAccount();
  const { chain } = useNetwork();

  const acceptProperty = useCallback(
    async (id: number, price: number) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const { hash } = await writeContract({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        address: BlockchainConstants[String(chain?.id) || '31'].arwaManager,
        abi: ArwaManagerAbi,
        functionName: 'createPropertyCollection',
        account: account.address,
        args: [id, Number(price.toFixed(0))],
      });
      return { hash };
    },
    [account],
  );

  const rejectProperty = useCallback(
    async (id: number) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const { hash } = await writeContract({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        address: BlockchainConstants[String(chain?.id) || '5'].arwaManager,
        abi: ArwaManagerAbi,
        functionName: 'updatePropertyState',
        account: account.address,
        args: [id, PropertyStatus.Rejected],
      });
      return hash;
    },
    [account],
  );

  return useMemo(
    () => ({
      acceptProperty,
      rejectProperty,
    }),
    [account],
  );
};
