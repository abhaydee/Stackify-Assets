import { FC, useEffect, useState } from 'react';

import ProfileInfo from '@/components/ProfileInfo';
import ProfileCards from '@/components/PropertyCards';

import styles from './styles.module.scss';

const Profile: FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <div>{isClient && <ProfileInfo />}</div>
      </div>
      {isClient && <ProfileCards />}
    </div>
  );
};

export default Profile;
