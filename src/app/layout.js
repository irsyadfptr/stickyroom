import { YjsProvider } from "@/components/YjsProvider";
import "./globals.css";
import Navigation from "@/components/Navigation";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <YjsProvider>
          <Navigation />
          <main className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 relative z-10">
            {children}
          </main>
        </YjsProvider>
      </body>
    </html>
  );
}
