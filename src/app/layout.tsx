import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPIP | Business Performance Intelligence",
  description: "Advisor workspace for evidence-based business performance assessment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
