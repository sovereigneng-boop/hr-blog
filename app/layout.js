import "./globals.css";

export const metadata = {
  title: "직장인 권리 설명서",
  description: "근로기준법(노동법), 연차(휴가), 연봉협상, 근로조건 등 직장인이라면 꼭 알아야 할 권리를 현직 인사 담당자가 가장 쉽게 알려드립니다"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-white text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-brand-600 text-white shadow-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tracking-tight">
                  직장인 권리 설명서
                </span>
                <span className="hidden text-sm text-brand-50/90 sm:inline">
                  근로기준법(노동법), 연차(휴가), 연봉협상, 근로조건 등 직장인이라면 꼭 알아야 할 권리를 현직 인사 담당자가 가장 쉽게 알려드립니다
                </span>
              </div>
            </div>
          </header>

          <main className="mx-auto flex-1 w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="border-t bg-brand-700">
            <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-brand-50/90 sm:px-6 lg:px-8">
              © {new Date().getFullYear()} 직장인 권리 설명서. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

