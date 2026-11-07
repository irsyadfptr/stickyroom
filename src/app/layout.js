import { Archivo_Black, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { YjsProvider } from "@/components/YjsProvider";
import "./globals.css";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", weight: ["500", "600", "700"] });
const archivo = Archivo_Black({ subsets: ["latin"], variable: "--font-archivo", weight: "400" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", weight: ["500", "700"] });

export const metadata = {
  title: "Stickyroom: a serverless multiplayer sticky-note board",
  description:
    "Real-time sticky notes, live cursors and chat built on Yjs CRDTs. Syncs over WebRTC and BroadcastChannel, saved in IndexedDB, with no backend.",
};

export const viewport = { themeColor: "#ffd23f" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${archivo.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <YjsProvider>{children}</YjsProvider>
      </body>
    </html>
  );
}
