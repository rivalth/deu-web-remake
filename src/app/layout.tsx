import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Dokuz Eylül Üniversitesi",
    template: "%s | Dokuz Eylül Üniversitesi",
  },
  description:
    "Girişimcilik ve yenilikçilik alanında geleceğe yön veren; eğitim ve bilim merkezi bir üniversite.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
