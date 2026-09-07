import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { initErrorReporter } from '@/lib/errorReporter';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initErrorReporter();
  }, []);

  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}