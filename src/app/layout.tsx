import Script from "next/script";
import { Literata, DM_Sans, DM_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import SupabaseProvider from "@/components/SupabaseProvider";
import FadeTextObserver from "@/components/ui/FadeTextObserver";

const literata = Literata({
  variable: "--font-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Flowr",
  description: "Visual-first productivity and knowledge workspace",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${literata.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased preload`}
    >
      <head>
        <Script
          id="hydration-lock"
          strategy="beforeInteractive"
        >
          {`
            (function() {
              try {
                const str = localStorage.getItem('flowr-storage');
                if (str) {
                  const state = JSON.parse(str).state;
                  if (state) {
                    // Sidebar Lock
                    if (state.isSidebarCollapsed) {
                      document.documentElement.style.setProperty('--sidebar-w', '0px');
                    } else if (state.sidebarWidth) {
                      document.documentElement.style.setProperty('--sidebar-w', state.sidebarWidth + 'px');
                    }
                    
                    // Dashboard Lock
                    if (state.isFullWidth === false) {
                      document.documentElement.style.setProperty('--dashboard-max-w', '1200px');
                    } else {
                      document.documentElement.style.setProperty('--dashboard-max-w', 'none');
                    }

                    if (state.theme) {
                      document.documentElement.setAttribute('data-theme', state.theme);
                    }

                    // Context Sniffing
                    if (state.activeEntityId) {
                      document.documentElement.setAttribute('data-initial-entity', state.activeEntityId);
                      // Set cookie for server-side skeleton selection on next refresh
                      document.cookie = "flowr-initial-entity=" + state.activeEntityId + "; path=/; max-age=31536000; SameSite=Lax";
                    }
                  }
                }
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SupabaseProvider>
          {children}
          <FadeTextObserver />
        </SupabaseProvider>
        <Script id="remove-preload" strategy="afterInteractive">
          {`document.documentElement.classList.remove('preload');`}
        </Script>
        <Script
          src="https://js.puter.com/v2/"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
