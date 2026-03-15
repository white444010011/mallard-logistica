import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MaterialLayoutClient } from '@/components/layout/material-layout-client';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    redirect('/login');
  }

  const session = await decrypt(sessionCookie.value);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pl-64">
      {/* Client component holding the App Bar & Navigation state */}
      <MaterialLayoutClient role={session.role} />
      
      {/* Page Content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto w-full mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
}
