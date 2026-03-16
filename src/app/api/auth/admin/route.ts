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

    let storedHash = await redis.get<string>('settings:admin_password');

    // Redis에 관리자 비밀번호가 없으면 환경변수 기본값 사용
    if (!storedHash) {
      const defaultPassword = process.env.ADMIN_PASSWORD;
      if (!defaultPassword) {
        return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
      }
      storedHash = hashPassword(defaultPassword);
    }

    const inputHash = hashPassword(password);
    if (inputHash !== storedHash) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await createSession('admin');
    const response = NextResponse.json({ success: true });
    response.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
