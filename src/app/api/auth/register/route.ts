import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import * as bcrypt from 'bcrypt';
import { encrypt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password, workLocation } = await request.json();

    if (!name || !email || !password || !workLocation) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User
    const [newUser] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      workLocation,
      role: 'USER' // Default role
    }).returning();

    // Create Session
    const sessionToken = await encrypt({
      userId: newUser.id,
      role: newUser.role,
    });

    const response = NextResponse.json({ 
      success: true, 
      user: {
        name: newUser.name,
        role: newUser.role,
        location: newUser.workLocation
      }
    });
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    if (error.code === '23505') {
       return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
