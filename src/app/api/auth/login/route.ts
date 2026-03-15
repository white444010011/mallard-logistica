import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { encrypt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Find User by Email
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // 2. Verify Password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // 3. Create Session (JWT)
    const sessionToken = await encrypt({
      userId: user.id,
      role: user.role,
    });

    // 4. Set HTTP-Only Cookie
    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar login' },
      { status: 500 }
    );
  }
}
