import { NextResponse } from 'next/server';
import { db } from '@/db';
import { transfers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await decrypt(sessionCookie.value);
    
    // Permission check: Only CD or ADMIN
    if (!session || !['CD', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status obrigatório' }, { status: 400 });
    }

    await db.update(transfers)
      .set({ status })
      .where(eq(transfers.id, id));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Update transfer error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
