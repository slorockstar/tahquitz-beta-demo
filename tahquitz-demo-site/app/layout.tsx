import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tahquitz | Project AntiGravity Beta",
  description: "Ultra-premium, hardware-agnostic VVIP Cabin Software Ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-tahquitz-900 text-white selection:bg-tahquitz-accent selection:text-black">
        {children}
      </body>
    </html>
  );
}
