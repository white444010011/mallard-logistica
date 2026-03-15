import { NextResponse } from 'next/server';
import { db } from '@/db';
import { transfers } from '@/db/schema';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await decrypt(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    const { photoUrl, origin, destination } = await request.json();

    if (!photoUrl || !origin || !destination) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const [newTransfer] = await db.insert(transfers).values({
      userId: session.userId,
      photoUrl,
      origin,
      destination,
      status: 'Pendente'
    }).returning();

    return NextResponse.json({ success: true, transferId: newTransfer.id });
     
  } catch (error) {
    console.error('Transfer creation error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  try {
     const data = await db.select().from(transfers).orderBy(transfers.createdAt);
     return NextResponse.json(data);
  } catch (error) {
     return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
