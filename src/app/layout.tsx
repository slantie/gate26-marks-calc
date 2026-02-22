import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GATE 2026 Marks Predictor & Analyzer",
  description: "Accurate GATE 2026 marks calculator and performance analyzer for CS and DA subjects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased text-slate-800 bg-slate-50 min-h-screen flex flex-col selection:bg-indigo-500/30 text-base" suppressHydrationWarning>
        <div className="flex-1 relative">
          <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          {children}
        </div>

        <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm">
          <div className="mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500">
            <p>© {new Date().getFullYear()} GATE Predictor System.</p>
            <a
              href="https://github.com/slantie/gate26-marks-calc"
              target="_blank"
              rel="noreferrer"
              className="mt-4 md:mt-0 flex items-center gap-2 hover:text-indigo-400 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              Open Source on GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
