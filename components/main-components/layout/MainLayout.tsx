import Sidebar from "@/components/main-components/layout/sidebar";
import Topbar from "@/components/main-components/layout/topbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f5efe6] text-[#3e2c23]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar />
        {children}
      </main>
    </div>
  );
}