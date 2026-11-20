import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SplitSmart",
  description: "Track shared expenses and group balances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
