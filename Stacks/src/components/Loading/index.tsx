import { FC } from 'react';

import styles from './styles.module.scss';

const Loading: FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
    </div>
  );
};

export default Loading;
