import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await decrypt(sessionCookie.value);
    
    if (!session || (session.role !== 'CD' && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    const { status } = await request.json();
    const validStatuses = ['pending', 'assumed', 'in_transit', 'delivered', 'canceled'];

    if (!status || !validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const existingOrder = await db.query.orders.findFirst({
        where: eq(orders.id, params.id)
    });

    if (!existingOrder) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });

    // Only the assigned user or an admin can force change the status
    if (existingOrder.assignedCdId !== session.userId && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Apenas o responsável pode alterar o status.' }, { status: 403 });
    }

    // Update status
    await db.update(orders)
      .set({ 
         status: status as any,
         updatedAt: new Date()
      })
      .where(eq(orders.id, params.id));

    // Optional: Send WhatsApp notification back to the original User here if requested in future.

    return NextResponse.json({ success: true });
     
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
