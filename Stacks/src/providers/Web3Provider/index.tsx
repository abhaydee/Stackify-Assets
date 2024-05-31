import { FC, PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import {
  connectorsForWallets,
  darkTheme,
  getDefaultWallets,
  Locale,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  ledgerWallet,
  trustWallet,
  okxWallet
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

import '@rainbow-me/rainbowkit/styles.css';
import { rootstockTestnet } from '../../pages/api/kyc-manager/customChain';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [rootstockTestnet],
  [publicProvider()],
);

const projectId = 'e62f401150fdcd6e5685881552882bc6';

const { wallets } = getDefaultWallets({
  appName: 'arwa',
  projectId,
  chains,
});

const appInfo = {
  appName: 'arwa',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
      okxWallet({ projectId, chains })
    ],
  },
]);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const { locale } = useRouter() as { locale: Locale };

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider
          appInfo={appInfo}
          chains={chains}
          locale={locale}
          theme={darkTheme({
            accentColor: '#4F6BFF',
          })}
        >
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
      <Toaster />
    </>
  );
};

export default Web3Provider;
