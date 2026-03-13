import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'site_session';

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export async function createSession(role: 'viewer' | 'admin'): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(role === 'admin' ? '2h' : '7d')
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<{ role: 'viewer' | 'admin' } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { role: 'viewer' | 'admin' };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<{ role: 'viewer' | 'admin' } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null;
}

export function getCookieName() {
  return COOKIE_NAME;
}
