import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Karim Ahmed — Full-Stack Developer",
	description:
		"Portfolio of Karim Ahmed — building modern web experiences with a focus on performance, clean design, and developer experience.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<div className="site-bg" aria-hidden>
					<div className="site-bg-grid" />
					<div className="site-bg-aurora" />
				</div>
				<TopNav />
				{children}
			</body>
		</html>
	);
}
