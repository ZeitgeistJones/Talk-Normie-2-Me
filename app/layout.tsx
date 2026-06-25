import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Talk Normie 2 Me', description: 'GitHub repos explained in plain English' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body style={{margin:0,fontFamily:'system-ui,sans-serif',background:'#fafafa'}}>{children}</body></html>;
}
