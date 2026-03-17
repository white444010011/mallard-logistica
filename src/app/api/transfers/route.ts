import { NextResponse } from 'next/server';
import { db } from '@/db';
import { transfers } from '@/db/schema';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { notifyCD } from '@/lib/whatsapp';
import { eq, desc } from 'drizzle-orm';
import { users } from '@/db/schema';

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

    const insertedTransfers = await db.insert(transfers).values({
      userId: session.userId,
      photoUrl,
      origin,
      destination,
      status: 'Pendente'
    }).returning({ id: transfers.id });

    const newTransfer = Array.isArray(insertedTransfers) && insertedTransfers[0];

    if (!newTransfer || !newTransfer.id) {
      console.error('Transfer creation returned invalid result:', insertedTransfers);
      return NextResponse.json({ error: 'Falha ao criar transporte' }, { status: 500 });
    }

    // Notify CD Team
    await notifyCD(`Novo transporte registrado: ${origin} -> ${destination}. Verifique o painel para assumir.`);

    return NextResponse.json({ success: true, transferId: newTransfer.id });
     
  } catch (error) {
    console.error('Transfer creation error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  try {
      const data = await db.select({
        id: transfers.id,
        userId: transfers.userId,
        photoUrl: transfers.photoUrl,
        origin: transfers.origin,
        destination: transfers.destination,
        status: transfers.status,
        createdAt: transfers.createdAt,
        deliveryPhotoUrl: transfers.deliveryPhotoUrl,
        deliveredAt: transfers.deliveredAt,
        userName: users.name
      })
      .from(transfers)
      .leftJoin(users, eq(transfers.userId, users.id))
      .orderBy(desc(transfers.createdAt));

      return NextResponse.json(data);
  } catch (error) {
     return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
