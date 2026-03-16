import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Mock Twilio / WhatsApp Service
export async function notifyCD(message: string) {
  try {
    // 1. Get all CD users
    const cdUsers = await db.select().from(users).where(eq(users.role, 'CD'));
    
    // 2. In a real scenario, we would trigger Twilio API here
    // For now, we log to keep things clean and functional
    console.log(`[WHATSAPP NOTIFICATION] to CD Team: ${message}`);
    
    for (const user of cdUsers) {
      if (user.whatsapp) {
        // Example: await twilio.messages.create({ body: message, to: user.whatsapp ... })
        console.log(`Sent to: ${user.whatsapp} (${user.name})`);
      }
    }
  } catch (error) {
    console.error('Failed to send WhatsApp notifications:', error);
  }
}
