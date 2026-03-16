import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { hashPassword } from '@/lib/crypto';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Settings available' });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (body.sitePassword) {
      const hashed = hashPassword(body.sitePassword);
      await redis.set('settings:site_password', hashed);
    }

    if (body.adminPassword) {
      const hashed = hashPassword(body.adminPassword);
      await redis.set('settings:admin_password', hashed);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
