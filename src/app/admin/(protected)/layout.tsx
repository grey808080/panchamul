import { redirect } from 'next/navigation';
import AdminSidebar, { AdminBottomNav } from '@/components/admin/AdminSidebar';
import { getAdminUser } from '@/lib/auth/admin';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>

      <AdminBottomNav />
    </div>
  );
}
