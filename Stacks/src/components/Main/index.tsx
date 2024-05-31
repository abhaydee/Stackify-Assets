import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import Arwa from '../../../public/assets/main-page.webp';
import { Button } from '../Button';

import styles from './styles.module.scss';

const Main: React.FC = () => {
  const { push } = useRouter();

  const go = (url: string) => {
    return async () => await push(url);
  };

  return (
    <div className=" flex flex-col items-center justify-center space-y-4 sm:flex-row mx-2  ">
      <Image className={styles.main_image} src={Arwa} alt={'Arwa'} style= {{ width : '70%', height: '600pxAR'}} />
      <div className="text-center mt-4 sm:mt-0 mx-4">
        <span className="text-lg">Start your journey now!</span>
        <Button className="mt-4" color="white" onClick={go('/create')}>
          Tokenise your property
        </Button>
      </div>
    </div>
  );
};

export default Main;
