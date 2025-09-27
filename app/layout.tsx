import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { WorkoutProvider } from "./contexts/WorkoutContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitAI Coach - Your Personal AI Fitness Trainer",
  description: "Transform your fitness journey with personalized AI-powered workout plans, progress tracking, and flexible scheduling.",
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
        <OnboardingProvider>
          <WorkoutProvider>
            {children}
          </WorkoutProvider>
        </OnboardingProvider>
      </body>
    </html>
  );
}
