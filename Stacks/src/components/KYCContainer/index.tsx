import { memo } from 'react';

import { useKycManager } from '@/hooks/blockchain/use-kyc-manager';

import { Button } from '../Button';

import styles from './styles.module.scss';

const KYCContainer = (): JSX.Element => {
  const { isKycPassed, isLoading, updateKyc } = useKycManager();

  return (
    <div className={styles.kycContainer}>
      {isLoading ? (
        <p>Loading</p>
      ) : (
        <p
          style={{ color: isKycPassed ? '' : 'color: var(--main-text-color)' }}
        >
          {isKycPassed ? 'Kyc passed' : 'Kyc not passed'}
        </p>
      )}
      {!isKycPassed && (
        <Button color="var(--main-color)" onClick={updateKyc}>
          Pass KYC
        </Button>
      )}
    </div>
  );
};

export default memo(KYCContainer);
