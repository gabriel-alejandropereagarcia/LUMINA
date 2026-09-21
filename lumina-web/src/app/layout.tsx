import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ChainProvider } from "@/context/ChainContext";
import { ToastProvider } from "@/context/ToastContext";
import { ToastContainer } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { EmpresaSessionProvider } from "@/hooks/useEmpresaSession";


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
  title: "Lumina | Impacto sin fricción",
  description:
    "Lumina ilumina el camino de la RSE. Conecta a quien quiere ayudar. Una factura, el 97,5% a la app, la familia no paga.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Lumina — ilumina el camino",
    description:
      "Conecta a quien quiere ayudar. Factura, 97,5% a la app, la familia no paga.",
    type: "website",
    locale: "es_ES",
    siteName: "Lumina",
    images: [
      {
        url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Lumina — impacto sin fricción",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina — ilumina el camino",
    description:
      "Empresas y apps en Lumina. El 97,5% llega cuando el trabajo se hizo. La familia no paga.",
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
            <ChainProvider>
              <WalletProvider>
                <EmpresaSessionProvider>
                  <Navbar />
                  <main className="flex-grow flex flex-col">
                    {children}
                  </main>
                  <Footer />
                  <ToastContainer />
                </EmpresaSessionProvider>
              </WalletProvider>
            </ChainProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

