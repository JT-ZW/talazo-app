import type { Metadata } from "next";
import "./globals.css";
import NotificationInitializer from '@/components/NotificationInitializer';
import FloatingChatButton from '@/components/FloatingChatButton';

export const metadata: Metadata = {
  title: "Talazo Agritech - Precision Agriculture for Zimbabwe",
  description: "AI-powered crop health monitoring system for smallholder farmers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans"
        suppressHydrationWarning
      >
        <NotificationInitializer />
        {children}
        <FloatingChatButton />
      </body>
    </html>
  );
}
