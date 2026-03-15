import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await decrypt(sessionCookie.value);
    
    if (!session || (session.role !== 'CD' && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    // Check if order exists and is pending
    const existingOrder = await db.query.orders.findFirst({
        where: eq(orders.id, params.id)
    });

    if (!existingOrder) {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    if (existingOrder.assignedCdId && existingOrder.assignedCdId !== session.userId) {
        return NextResponse.json({ error: 'Este pedido já foi assumido por outro membro.' }, { status: 409 });
    }

    // Assume order
    await db.update(orders)
      .set({ 
         status: 'assumed', 
         assignedCdId: session.userId,
         updatedAt: new Date()
      })
      .where(eq(orders.id, params.id));

    return NextResponse.json({ success: true });
     
  } catch (error) {
    console.error('Assume order error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
