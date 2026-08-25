import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DailyNest — Fresh chapatis, your schedule", template: "%s · DailyNest" },
  description: "Flexible fresh chapati deliveries across Chennai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
