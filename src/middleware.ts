import { NextResponse, type NextRequest } from 'next/server';
import { decrypt, encrypt } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/admin', '/order'];
const publicRoutes = ['/login', '/'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Check if the requested route is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 2. Extract Session Cookie
  const sessionCookie = request.cookies.get('session');
  let session = null;

  if (sessionCookie?.value) {
     session = await decrypt(sessionCookie.value);
  }

  // 3. Route Permissions Routing
  if (isProtectedRoute && !session) {
    // Not logged in, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicRoute && session && path === '/login') {
    // Already logged in, avoid showing login page
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 4. Role Based Checking (RBAC) Example
  if (path.startsWith('/admin') && session) {
    if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
        // Redirect standard users back to their dashboard if trying to access admin
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 5. Refresh session if active
  const response = NextResponse.next();
  if (session && sessionCookie) {
    // Optionally rotate the JWT or verify its expiry
    // response.cookies.set('session', refreshedToken, ... )
  }

  return response;
}

// Ensure the middleware runs on relevant paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};
