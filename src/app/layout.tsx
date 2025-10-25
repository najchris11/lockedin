import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import { TimerNotificationProvider } from "@/components/TimerNotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LockIn - Stay Focused, Stay Productive",
  description: "A productivity web app that combines Pomodoro timers, AI-powered focus tracking, music integration, and task management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
        <PomodoroProvider>
          <TimerNotificationProvider>
            {children}
          </TimerNotificationProvider>
        </PomodoroProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
