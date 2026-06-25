'use client';
import { RainbowKitProvider, getDefaultConfig, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'Talk Normie 2 Me',
  projectId: 'b8b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5',
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={dark ? darkTheme({ borderRadius: 'medium' }) : lightTheme({ borderRadius: 'medium' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
