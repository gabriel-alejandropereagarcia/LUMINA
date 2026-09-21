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
    "Una empresa quiere financiar salud, educación o asistencia. Una familia lo necesita. El capital se pierde en informes. Lumina lo resuelve: factura, 97,5% a la app, el usuario nunca paga.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Lumina — impacto sin fricción",
    description:
      "Factura, no cripto. 97,5% a la app si el hecho ocurrió. El usuario final nunca paga.",
    type: "website",
    locale: "es_ES",
    siteName: "Lumina",
    images: [
      {
        url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Lumina — protocolo de RSE on-chain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina — RSE que se paga cuando el hito es real",
    description:
      "Empresa sin wallet. App cobra 97,5%. Usuario no paga. Stellar.",
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

