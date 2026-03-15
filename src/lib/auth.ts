import * as jose from 'jose';

// Get the secret from environment variables
const secretStr = process.env.JWT_SECRET || 'fallback_secret_only_for_dev_never_prod';
const secret = new TextEncoder().encode(secretStr);

export interface SessionPayload {
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CD';
}

export async function encrypt(payload: SessionPayload) {
  return new jose.SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 24 hours expiry
    .sign(secret);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jose.jwtVerify(session, secret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}
