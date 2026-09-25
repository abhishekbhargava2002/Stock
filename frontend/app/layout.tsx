import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Stockora by Trivoxa", description: "Inventory management SaaS for Indian businesses" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
