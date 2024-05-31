import { useMemo } from 'react';
import { useAccount, useContractRead, useNetwork } from 'wagmi';

import { BlockchainConstants, PropertyType } from '@/data';
import { ArwaManagerAbi } from '@/data/abi/arwa-manager.abi';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useArwaUser = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { data: isVerifier } = useContractRead({
    abi: ArwaManagerAbi,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    address: BlockchainConstants[String(chain?.id) || '31'].arwaManager,
    functionName: 'verifier',
    args: [address],
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { data: userProperties } = useContractRead({
    abi: ArwaManagerAbi,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    address: BlockchainConstants[String(chain?.id) || '31'].arwaManager,
    functionName: 'userProperties',

    args: [address],
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { data: verifierProperties } = useContractRead({
    abi: ArwaManagerAbi,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    address: BlockchainConstants[String(chain?.id) || '31'].arwaManager,
    functionName: 'getAvailableVerifierProperties',

    account: address,
  });

  return useMemo(
    () => ({
      isVerifier,
      userProperties: userProperties as PropertyType[],
      verifierProperties: verifierProperties as PropertyType[],
    }),
    [userProperties, isVerifier],
  );
};
