import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import { ToastContainer } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumina Impact Protocol | Infraestructura ReFi para Hitos de Impacto",
  description: "Conectamos capital corporativo con impacto social verificado on-chain en Stellar/Soroban. Transparencia ESG, trazabilidad criptográfica, cero fricción administrativa.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Lumina Impact Protocol",
    description: "Infraestructura ReFi universal para financiamiento programable de hitos de impacto. Ambiental, Social, Educación y Salud — verificado on-chain en Stellar.",
    type: "website",
    locale: "es_ES",
    siteName: "Lumina",
    images: [
      {
        url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Lumina Impact Protocol — Infraestructura ReFi Universal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina Impact Protocol",
    description: "Infraestructura ReFi universal para financiamiento programable de hitos de impacto. Ambiental, Social, Educación y Salud.",
    images: [
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&h=630&fit=crop",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="flex flex-col min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ToastProvider>
            <WalletProvider>
              <Navbar />
              <main className="flex-grow flex flex-col">
                {children}
              </main>
              <Footer />
              <ToastContainer />

            </WalletProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

