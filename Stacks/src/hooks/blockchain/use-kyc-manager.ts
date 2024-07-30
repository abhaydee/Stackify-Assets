import { useState, useEffect } from 'react';
import { StacksTestnet } from '@stacks/network';
import { userSession } from './user-session'; // Assuming you have a user session setup
import { callReadOnlyFunction, callPublicFunction } from '@stacks/transactions';

const useKycManager = () => {
  const [isKycPassed, setIsKycPassed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const contractAddress = 'ST3J...'; // Your contract address
  const contractName = 'kycStore';

  const fetchKycStatus = async () => {
    setIsLoading(true);
    try {
      const options = {
        contractAddress,
        contractName,
        functionName: 'check-kyc-status',
        functionArgs: [],
        network: new StacksTestnet(),
        senderAddress: userSession.loadUserData().profile.stxAddress.testnet,
      };

      const response = await callReadOnlyFunction(options);
      setIsKycPassed(response.result);
    } catch (error) {
      console.error(error);
      setIsKycPassed(null);
    }
    setIsLoading(false);
  };

  const updateKyc = async () => {
    setIsLoading(true);
    try {
      const options = {
        contractAddress,
        contractName,
        functionName: 'set-kyc-status',
        functionArgs: [
          userSession.loadUserData().profile.stxAddress.testnet,
          true,
        ],
        network: new StacksTestnet(),
        senderAddress: userSession.loadUserData().profile.stxAddress.testnet,
        postConditionMode: 0,
      };

      const response = await callPublicFunction(options);
      if (response.error) {
        throw new Error(response.error);
      }

      fetchKycStatus();
    } catch (error) {
      console.error(error);
      setIsKycPassed(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  return {
    isKycPassed,
    isLoading,
    updateKyc,
  };
};

export { useKycManager };
