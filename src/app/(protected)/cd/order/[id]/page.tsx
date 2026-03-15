import { db } from '@/db';
import { orders, orderItems, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OrderDetailsClient } from '@/components/cd/order-details-client';

export default async function CdOrderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) redirect('/login');
  
  const session = await decrypt(sessionCookie.value);
  if (!session || (session.role !== 'CD' && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      redirect('/dashboard');
  }

  // Fetch the order with its items and products, and user
  const orderData = await db.query.orders.findFirst({
    where: eq(orders.id, params.id),
    with: {
      user: true, // The requester
    }
  });

  if (!orderData) return <div>Pedido não encontrado.</div>;

  // Fetch items
  const items = await db.select({
      quantity: orderItems.quantity,
      product: { name: orderItems.productName }
  })
  .from(orderItems)
  .where(eq(orderItems.orderId, params.id));

  // If order is assigned, fetch the CD user who assumed it
  let assignedUser = null;
  if (orderData.assignedCdId) {
      const u = await db.select().from(users).where(eq(users.id, orderData.assignedCdId)).limit(1);
      if (u.length) assignedUser = u[0];
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="pb-4 border-b border-gray-200">
         <h1 className="text-2xl font-bold tracking-tight text-gray-900">Detalhes do Pedido</h1>
         <p className="text-sm text-gray-500 mt-1">Gerencie o status e alocação desta solicitação.</p>
      </div>

      <OrderDetailsClient 
         order={orderData} 
         items={items} 
         assignedUser={assignedUser}
         currentUserId={session.userId} 
      />
    </div>
  );
}
