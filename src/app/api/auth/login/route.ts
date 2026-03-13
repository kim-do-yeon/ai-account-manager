import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { hashPassword } from '@/lib/crypto';
import { createSession, getCookieName } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const storedHash = await redis.get<string>('settings:site_password');
    if (!storedHash) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    const inputHash = hashPassword(password);
    if (inputHash !== storedHash) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await createSession('viewer');
    const response = NextResponse.json({ success: true });
    response.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
