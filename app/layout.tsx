import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AidBridge AI — Community Crisis & Resource Operations",
    template: "%s · AidBridge AI",
  },
  description:
    "AidBridge AI turns messy community needs into structured, actionable aid workflows for nonprofits, schools, city teams, and volunteer organizations.",
  keywords: [
    "public interest technology",
    "nonprofit software",
    "AI triage",
    "community aid",
    "volunteer coordination",
  ],
  authors: [{ name: "Nikniv2007" }],
  openGraph: {
    title: "AidBridge AI",
    description:
      "Turn messy community needs into structured, actionable aid workflows.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash: apply stored/system preference before paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('aidbridge-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
