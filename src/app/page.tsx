import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export default async function RootPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (sessionCookie?.value) {
    const session = await decrypt(sessionCookie.value);
    
    if (session) {
      if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
        redirect('/admin');
      } else {
        redirect('/dashboard');
      }
    }
  }

  // If no valid session, go to login
  redirect('/login');
}
