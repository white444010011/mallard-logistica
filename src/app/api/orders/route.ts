import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, users } from '@/db/schema';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await decrypt(sessionCookie.value);
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    // 1. Create the Order
    const [newOrder] = await db.insert(orders).values({
      userId: session.userId,
      status: 'pending'
    }).returning();

    // 2. Insert items and decrement stock
    for (const item of items) {
      // Insert item
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.id,
        quantity: item.quantity
      });

      // Fetch current stock
      const [productData] = await db.select().from(products).where(eq(products.id, item.id));
      if (productData) {
         // Decrement stock
         await db.update(products)
           .set({ availableStock: Math.max(0, productData.availableStock - item.quantity) })
           .where(eq(products.id, item.id));
      }
    }

    // 3. Trigger WhatsApp Notification to CD
    // Find CD members to notify (either all or specific number from env)
    const cdUsers = await db.select().from(users).where(eq(users.role, 'CD'));
    
    // Asynchronous Twilio Call (do not await to block response if possible)
    sendWhatsAppNotification(newOrder.id, items.length).catch(console.error);

    return NextResponse.json({ success: true, orderId: newOrder.id });
     
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

async function sendWhatsAppNotification(orderId: string, itemsCount: number) {
   const accountSid = process.env.TWILIO_ACCOUNT_SID;
   const authToken = process.env.TWILIO_AUTH_TOKEN;
   const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;
   const recipientNumber = process.env.CD_WHATSAPP_GROUP_NUMBER; // Fallback or direct to CD numbers

   if (!accountSid || !authToken || !twilioNumber) {
      console.warn('Twilio credentials completely missing, skipping WhatsApp notification.');
      return;
   }

   // Optional: Replace localhost with production domain later
   const assumeLink = `http://localhost:3000/cd/order/${orderId}`;
   const messageBody = `*NOVO PEDIDO Mallard Logística* 🚨\n\n🟢 *ID:* #${orderId.slice(0, 6)}\n📦 *Itens:* ${itemsCount}\n\n👉 *Clique aqui para assumir o pedido:*\n${assumeLink}`;

   try {
     const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
     const formData = new URLSearchParams();
     formData.append('To', recipientNumber || 'whatsapp:+55xx9xxxxxxx'); // Requires valid number to work
     formData.append('From', twilioNumber);
     formData.append('Body', messageBody);

     const response = await fetch(url, {
       method: 'POST',
       headers: {
         'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       body: formData
     });

     if (!response.ok) {
        const errorData = await response.text();
        console.error('Twilio Error:', errorData);
     } else {
        console.log('WhatsApp notification dispatched to CD successfully.');
     }
   } catch (error) {
      console.error('Failed to send WhatsApp message via Twilio fetch', error);
   }
}
