import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Arwa from '../../../public/assets/Rwa_logo.webp';
import ConnectionButton from '../ConnectionButton';

import styles from './styles.module.scss';

const Header: FC = () => {
  return (
    <div className="mx-auto my-8 px-2 flex flex-wrap justify-center w-full max-w-screen-lg items-center sm:justify-between shadow-up-down z-2">
      <div className="flex items-center gap-4 sm:gap-8">
        <Link
          href={'/'}
          className="flex items-center gap-4 text-center text-lg p-4 text-main-card-color hover:text-main-color"
        >
          <Image
            src={Arwa}
            alt={'Arwa'}
           style={{width : '120px', height : '120px'}}
           className={styles.header_image}


          />
        </Link>
        <Link
          className="text-main-card-color text-lg p-4 hover:text-main-color"
          href={'market'}
        >
          Market
        </Link>
      </div>

      <div className="flex items-center mt-0 mb-2 sm:mb-0">
        <ConnectionButton />
      </div>
    </div>
  );
};

export default Header;
