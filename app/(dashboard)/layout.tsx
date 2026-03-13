import SidebarNav from "@/components/shared/SidebarNav";
import GlobalBreadcrumb from "@/components/shared/GlobalBreadcrumb";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — always visible, never remounts */}
      <SidebarNav />

      {/* Page content swaps here on every navigation */}
      <main className="flex-1 overflow-y-auto bg-white p-7">
        <GlobalBreadcrumb />
        <hr className="border-slate-200 -mx-7 mb-6" />
        {children}
      </main>
    </div>
  );
}
