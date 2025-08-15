import "./globals.css";
import type { Metadata } from "next";
import Providers from "../components/Providers";
import Header from "../components/Header";
import CartDrawer from "../components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "Kodomo 2.0",
  description: "Menu, QR ordering, Membership",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Header />
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
