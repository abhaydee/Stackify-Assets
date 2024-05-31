import { memo } from 'react';
import { useAccount, useBalance } from 'wagmi';

import styles from './styles.module.scss';

const decimalPlaces = 4;

const Balance = (): JSX.Element => {
  const { address } = useAccount();

  const {
    data,
    isError,
    isLoading: balanceLoading,
  } = useBalance({
    address: address,
  });

  if (balanceLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  const formattedBalance = data?.formatted
    ? Number.parseFloat(data?.formatted).toFixed(decimalPlaces)
    : '';
  return (
    <div className={styles.main}>
      <p>
        Balance: {formattedBalance} STX
      </p>
    </div>
  );
};

export default memo(Balance);
