import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await decrypt(sessionCookie.value);
    // Only CD or ADMIN can process status via AI
    if (!session || !['CD', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    const { text } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente de logística do Grupo Mallard. Seu objetivo é extrair o STATUS de um transporte a partir de uma mensagem de áudio ou texto. Status permitidos: 'Pendente', 'Em Trânsito', 'Entregue', 'Em Separação', 'Concluído'. Responda APENAS um JSON plano com a chave 'status' e opcionalmente 'observacao'."
        },
        {
          role: "user",
          content: `Mensagem: "${text}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return NextResponse.json(result);

  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Erro ao processar IA' }, { status: 500 });
  }
}
