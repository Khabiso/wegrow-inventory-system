import Footer from "@/components/Footer";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata = {
  title: "WeGrow Inventory System",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Sidebar />

        <div
          className="main-layout"
          style={{
            marginLeft: "245px",
            width: "calc(100% - 245px)",
            boxSizing: "border-box",
          }}
        >
          <main
          className="main"
          style={{
          marginLeft: 0,
          minWidth: 0,
          paddingBottom: "60px",
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