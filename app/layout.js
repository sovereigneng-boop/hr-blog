import "./globals.css";
import { Suspense } from "react";
import ThemeToggle from "../components/ThemeToggle";
import SearchBox from "../components/SearchBox";
import TopNav from "../components/TopNav";

export const metadata = {
  title: "직장인 권리 설명서",
  description: "근로기준법(노동법), 연차(휴가), 연봉협상, 근로조건 등 직장인이라면 꼭 알아야 할 권리를 현직 인사 담당자가 가장 쉽게 알려드립니다"
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="gQAcQN2IG0tzzhNTfqkjIp2nfram8i-u06Sce4uq7bA"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A2540] shadow-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tracking-tight text-white">
                  직장인 권리 설명서
                </span>
                <span className="hidden max-w-3xl text-sm text-white/80 sm:inline">
                  근로기준법(노동법), 연차(휴가), 연봉협상, 근로조건 등 직장인이라면 꼭 알아야 할 권리를 현직 인사 담당자가 가장 쉽게 알려드립니다
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          <TopNav />

          <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-[1fr_minmax(160px,18%)]">
              <div className="space-y-8 md:hidden">
                <Suspense fallback={<div className="h-[76px]" />}>
                  <SearchBox />
                </Suspense>
              </div>

              <div className="min-w-0">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
                  {children}
                </div>
              </div>

              <aside className="hidden md:block">
                <div className="sticky top-[7.25rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <Suspense fallback={<div className="h-[76px]" />}>
                    <SearchBox />
                  </Suspense>
                </div>
              </aside>
            </div>
          </main>

          <footer className="border-t border-slate-200/70 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8 dark:text-slate-400">
              © {new Date().getFullYear()} 직장인 권리 설명서. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

