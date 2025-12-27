import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { TopUpModal } from "@/components";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WhisperPay - Anonymous Confession & Unlock-to-Chat",
  description: "Chia sẻ bí mật. Kết nối tâm hồn. Mở khóa những khoảnh khắc đặc biệt. Share secrets. Connect souls. Unlock special moments.",
  keywords: ["confession", "anonymous", "chat", "social", "vietnam", "whisper"],
  authors: [{ name: "WhisperPay" }],
  openGraph: {
    title: "WhisperPay - Anonymous Confession & Unlock-to-Chat",
    description: "Chia sẻ bí mật. Kết nối tâm hồn.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark min-h-screen`}
      >
        <AppProvider>
          <TopUpModal />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
