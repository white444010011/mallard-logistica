import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const payload = await decrypt(session);

    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name, workLocation } = await request.json();

    if (!name || !workLocation) {
      return NextResponse.json({ error: 'Nome e Lotação são obrigatórios' }, { status: 400 });
    }

    // Update User Profile
    await db.update(users)
      .set({ 
        name, 
        workLocation 
      })
      .where(eq(users.id, payload.userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
