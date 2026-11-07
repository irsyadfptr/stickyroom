import { Caveat, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { YjsProvider } from "@/components/YjsProvider";
import "./globals.css";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["500", "700"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata = {
  title: "Stickyroom: a serverless multiplayer sticky-note board",
  description:
    "Real-time sticky notes, live cursors and chat built on Yjs CRDTs. Syncs over WebRTC and BroadcastChannel, saved in IndexedDB, with no backend.",
};

export const viewport = { themeColor: "#f4efe4" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${caveat.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <YjsProvider>{children}</YjsProvider>
      </body>
    </html>
  );
}
