import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "말랑저금통",
  description: "어린이를 위한 재미있는 디지털 저금통 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body className="bg-background text-textColor font-sans min-h-screen flex flex-col items-center justify-start antialiased selection:bg-primary selection:text-textColor">
        <main className="w-full max-w-md mx-auto flex-1 flex flex-col p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
