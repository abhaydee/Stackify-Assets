import { memo } from 'react';
import Image from 'next/image';
import { useDisclosure } from '@nextui-org/modal';
import { useAccount } from 'wagmi';

import Avatar from '@/components/Avatar';
import { useArwaUser } from '@/hooks/blockchain/manager/use-arwa-user';
import { useKycManager } from '@/hooks/blockchain/use-kyc-manager';

import SuccessIcon from '../../../public/assets/success.svg';
import Balance from '../Balance';
import { Button } from '../Button';
import NetworkSwitcher from '../NetworkSwitcher';
import ProfileModal from '../ProfileModal';

import styles from './styles.module.scss';

const ProfileInfo = (): JSX.Element => {
  const { address } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isKycPassed, isLoading } = useKycManager();
  const { isVerifier } = useArwaUser();

  const kycNotPassed = !isKycPassed && !isLoading && !isVerifier;
  return (
    <div className="mx-2 flex flex-col sm:flex-row">
      <Avatar
        profileImage={address || ''}
        className={styles.avatarContainer}
        size={100}
      />

      <div className="w-full justify-between flex flex-col sm:flex-row items-center sm:items-baseline mt-4 sm:mt-0">
        <div className="flex flex-col ml-5">
          <Balance />
          {kycNotPassed && (
            <Button color="rgb(219, 7, 7)" onClick={onOpen}>
              <p>Pass KYC</p>
            </Button>
          )}
          <div>
            {!isVerifier && (
              <div className={styles.kycContainer}>
                {isLoading ? (
                  <p>Loading..</p>
                ) : (
                  <p
                    style={{
                      color: isKycPassed
                        ? 'rgb(8, 216, 84) '
                        : 'rgb(219, 7, 7)',
                      display: 'flex',
                      gap: '7px',
                    }}
                  >
                    {isKycPassed ? 'Kyc passed' : 'Kyc not passed'}
                    {isKycPassed ? (
                      <Image
                        src={SuccessIcon}
                        alt={'Success icon'}
                        width={28}
                        height={28}
                      />
                    ) : (
                      <></>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <NetworkSwitcher />
      </div>
      <ProfileModal isOpen={isOpen} onClose={onClose} />
    </div>
  );
};

export default memo(ProfileInfo);
