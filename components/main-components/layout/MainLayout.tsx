import Sidebar from "@/components/main-components/layout/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#3e2c23]">
      <Sidebar />
      <main className="min-h-screen lg:ml-[280px]">
        {children}
      </main>
    </div>
  );
}