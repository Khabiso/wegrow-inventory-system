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
      <body>
        <div className="app">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
