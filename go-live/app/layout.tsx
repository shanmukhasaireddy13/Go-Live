import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#14181b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "https://go-live.me"),
  title: {
    default: "go-live.me — Zero-Effort Free Wildcard Subdomains for Developers",
    template: "%s | go-live.me",
  },
  description:
    "Claim your free *.go-live.me subdomain in 30 seconds. Connect Vercel, Next.js, or custom CNAMEs with global Anycast edge routing.",
  keywords: [
    "subdomain",
    "free subdomain",
    "vercel deployment",
    "dns routing",
    "anycast dns",
    "custom domain",
    "developer tools",
    "go-live.me",
    "cloud routing",
    "cname generator",
    "ssl certificates",
  ],
  authors: [{ name: "Go-Live Team" }],
  creator: "Go-Live",
  publisher: "Go-Live",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://go-live.me",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://go-live.me",
    siteName: "go-live.me",
    title: "go-live.me — Zero-Effort Free Subdomains for Any Website",
    description:
      "Claim your free *.go-live.me developer subdomain in seconds with instant global Anycast routing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "go-live.me — Free Wildcard Subdomains for Developers",
    description:
      "Instant Anycast DNS slots for your projects under *.go-live.me. Connect Vercel in 1 click.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Go-Live.me",
  url: "https://go-live.me",
  description: "Instant, Globally-Distributed Anycast Subdomains for Developers.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "1-Click Vercel Integration",
    "300+ Anycast Edge PoPs",
    "Automatic SSL / TLS 1.3",
    "Custom CNAME and A Record Routing",
    "Live DNS Telemetry",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", plusJakartaSans.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-(--color-paper) text-(--color-ink)">
        <TooltipProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              className: "font-sans text-xs bg-(--color-card) border border-(--color-rule) text-(--color-ink) shadow-xl rounded-xl",
            }}
          />
        </TooltipProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
