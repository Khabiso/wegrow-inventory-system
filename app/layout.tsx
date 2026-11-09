
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "WeGrow Inventory System",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <Sidebar />

        <div className="main-layout">
          <main
            className="main"
            style={{
              marginLeft: 0,
              minWidth: 0,
              width: "100%",
              flex: 1,
              paddingBottom: "60px",
              boxSizing: "border-box",
            }}
          >
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
