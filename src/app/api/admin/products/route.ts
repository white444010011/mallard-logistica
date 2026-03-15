import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
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
    
    // Strict RBAC: Only ADMIN or SUPER_ADMIN can create products
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    const { name, description, availableStock } = await request.json();

    if (!name || availableStock === undefined) {
      return NextResponse.json({ error: 'Nome e quantidade inicial são obrigatórios' }, { status: 400 });
    }

    const [newProduct] = await db.insert(products).values({
      name,
      description,
      availableStock,
    }).returning();

    return NextResponse.json({ success: true, product: newProduct });
     
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
