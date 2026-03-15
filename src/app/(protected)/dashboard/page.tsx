import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { products, orders } from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { UserDashboard } from '@/components/dashboard/user-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { CdDashboard } from '@/components/dashboard/cd-dashboard';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  // We can assume session exists because of the protected layout,
  // but let's safely type it
  const session = await decrypt(sessionCookie?.value);

  if (!session) return null;

  const role = session.role;

  // 1. If USER: Load available stock for them to create orders
  if (role === 'USER') {
    const availableProducts = await db.query.products.findMany({
      where: (products, { gt }) => gt(products.availableStock, 0),
      orderBy: [desc(products.createdAt)]
    });
    return <UserDashboard products={availableProducts} />;
  }

  // 2. If ADMIN: Show a high-level summary of all orders recently created
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    const recentOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 10,
      with: {
        user: true,
      }
    });
    return <AdminDashboard recentOrders={recentOrders} />;
  }

  // 3. If CD: Show pending and assumed orders
  if (role === 'CD') {
    const activeOrders = await db.query.orders.findMany({
      where: inArray(orders.status, ['pending', 'assumed', 'in_transit']),
      orderBy: [desc(orders.createdAt)],
      with: {
        user: true,
      }
    });
    return <CdDashboard activeOrders={activeOrders} />;
  }

  return <div>Role not recognized.</div>;
}
