import { FC } from 'react';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Avatar from '../Avatar';
import { Button } from '../Button';

import styles from './styles.module.scss';

const ConnectionButton: FC = () => {
  const { push } = useRouter();

  const go = (url: string) => {
    return async () => await push(url);
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }): JSX.Element => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {((): JSX.Element => {
              if (!connected) {
                return (
                  <Button color="var(--main-color)" onClick={openConnectModal}>
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }

              return (
                <Button
                  variant="outline"
                  color="var(--main-card-color)"
                  onClick={go('/profile')}
                >
                  <div className={styles.profile_content}>
                    <div className={styles.avatar_container}>
                      <Avatar profileImage={account.address} />
                    </div>
                    <span className={styles.display_name}>
                      {account.displayName}
                    </span>
                  </div>
                </Button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectionButton;
