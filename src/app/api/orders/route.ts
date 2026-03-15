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
    if (!session) {
      return NextResponse.json({ error: 'Acesso Negado' }, { status: 403 });
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Lista vazia' }, { status: 400 });
    }

    // 1. Create the Order
    const [newOrder] = await db.insert(orders).values({
      userId: session.userId,
      status: 'pending'
    }).returning();

    // 2. Insert items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productName: item.name,
        quantity: item.quantity
      });
    }

    // 3. Trigger WhatsApp Notification to CD
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

   if (!accountSid || !authToken || !twilioNumber) {
      console.warn('Twilio credentials completely missing, skipping WhatsApp notification.');
      return;
   }

   // 1. Fetch all CD users with a whatsapp number
   const cdUsers = await db.select().from(users).where(eq(users.role, 'CD'));
   const recipients = cdUsers.filter(u => u.whatsapp).map(u => u.whatsapp) as string[];

   if (recipients.length === 0) {
      console.warn('No CD users with WhatsApp found in DB.');
      return;
   }

   const assumeLink = `http://localhost:3000/cd/order/${orderId}`;
   const messageBody = `*NOVO PEDIDO Mallard Logística* 🚨\n\n🟢 *ID:* #${orderId.slice(0, 6)}\n📦 *Itens:* ${itemsCount}\n\n👉 *Clique aqui para assumir o pedido:*\n${assumeLink}`;

   // 2. Send to each recipient
   for (const recipient of recipients) {
     try {
       const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
       const formData = new URLSearchParams();
       formData.append('To', recipient);
       formData.append('From', twilioNumber);
       formData.append('Body', messageBody);

       await fetch(url, {
         method: 'POST',
         headers: {
           'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: formData
       });
     } catch (error) {
        console.error(`Failed to send WhatsApp to ${recipient}`, error);
     }
   }
}

export async function GET() {
  try {
     const data = await db.select().from(orders).orderBy(orders.createdAt);
     
     // Fetch items for each order (simple approach since it's a small app)
     const fullOrders = await Promise.all(data.map(async (order) => {
       const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
       return { ...order, items };
     }));

     return NextResponse.json(fullOrders);
  } catch (error) {
     console.error('GET orders error:', error);
     return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
