import { Header } from "@/components/Header";

export function Page({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header title={title} />

      <section className="content">
        {children}
      </section>
    </>
  );
}