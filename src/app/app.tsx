'use client';
import { Analytics } from '@vercel/analytics/react';
import { PropsWithChildren } from 'react';
import { ToastContainer, Zoom, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorBoundary } from 'src/components/errors/ErrorBoundary';
import { Footer } from 'src/components/nav/Footer';
import { Header } from 'src/components/nav/Header';
import { WagmiContext } from 'src/config/wagmi';
import { TransactionModal } from 'src/features/transactions/TransactionModal';
import { useIsSsr } from 'src/utils/ssr';
import 'src/vendor/inpage-metamask';
import 'src/vendor/polyfill';

export function App({ children }: PropsWithChildren<any>) {
  return (
    <ErrorBoundary>
      <SafeHydrate>
        <WagmiContext>
          <BodyLayout>{children}</BodyLayout>
          <TransactionModal />
          <ToastContainer transition={Zoom} position={toast.POSITION.BOTTOM_RIGHT} />
        </WagmiContext>
      </SafeHydrate>
      <Analytics />
    </ErrorBoundary>
  );
}

function SafeHydrate({ children }: PropsWithChildren<any>) {
  // Avoid SSR for now as it's not needed and it
  // complicates wallet integrations and media query hooks
  const isSsr = useIsSsr();
  if (isSsr) {
    return <div></div>;
  } else {
    return children;
  }
}

export function BodyLayout({ children }: PropsWithChildren<any>) {
  return (
    <div className="min-w-screen relative flex h-full min-h-screen w-full flex-col justify-between bg-taupe-100 text-black">
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
