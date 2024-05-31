import { FC } from 'react';

import MarketCards from '@/components/MarketCards';

import styles from './styles.module.scss';

const Market: FC = () => {
  return (
    <div className="mx-2 flex flex-col items-center justify-center gap-8 sm:flex-row">
      <div>
        <p className={styles.tokenText}>Marketplace</p>
        <MarketCards />
      </div>
    </div>
  );
};

export default Market;
