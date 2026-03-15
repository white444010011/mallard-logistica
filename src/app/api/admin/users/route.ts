import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await decrypt(sessionCookie.value);
    
    // Strict RBAC: Only ADMIN or SUPER_ADMIN can create users
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Only SUPER_ADMIN can create another SUPER_ADMIN or Admin
    if (role === 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Permissão insuficiente para criar Super Administrador' }, { status: 403 });
    }

    // Check if email exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
        return NextResponse.json({ error: 'E-mail já está em uso' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      passwordHash: hashedPassword,
      role: role as any,
    }).returning({
       id: users.id,
       name: users.name,
       email: users.email,
       role: users.role,
       createdAt: users.createdAt
    });

    return NextResponse.json({ success: true, user: newUser });
     
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
