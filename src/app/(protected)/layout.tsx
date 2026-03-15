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
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <main className="lux-container py-12 md:py-20 min-h-screen flex flex-col">
        {children}
      </main>
      
      {/* Bottom gap for mobile navigation if needed, keeping it clean for now */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
