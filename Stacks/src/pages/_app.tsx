import { ReactNode, Suspense } from 'react';
import { AppProps } from 'next/app';
import { Orbitron } from 'next/font/google';
import { Meta } from '@components/meta';
import { NextUIProvider } from '@nextui-org/system';

import ErrorBoundary from '@/components/ErrorBoundary';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import Web3Provider from '@/providers/Web3Provider';

import '../styles/global.css';

// eslint-disable-next-line new-cap
const orbitron = Orbitron({
  weight: '400',
  subsets: ['latin'],
  variable: '--orbitron-font',
});

function MyApp({ Component, pageProps }: AppProps): ReactNode {
  return (
    <main className={`${orbitron.className}`}>
      <Meta />
      <Suspense fallback={<Loading />}>
        <Web3Provider>
        <NextUIProvider style={{ backgroundImage: 'url("https://i.postimg.cc/pXBtwsvf/landingpage.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <ErrorBoundary>
              <div className="mx-auto max-w-screen-lg min-h-screen flex flex-col justify-between">
                <Header />
                <Component {...pageProps} />

                <Footer />
              </div>
            </ErrorBoundary>
          </NextUIProvider>
        </Web3Provider>
      </Suspense>
    </main>
  );
}

export default MyApp;
