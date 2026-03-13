import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { encrypt, decrypt } from '@/lib/crypto';
import { getSessionFromCookies } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountIds = await redis.zrange('accounts:index', 0, -1);
    if (!accountIds || accountIds.length === 0) {
      return NextResponse.json([]);
    }

    const accounts = await Promise.all(
      accountIds.map(async (id) => {
        const data = await redis.hgetall(`account:${id}`);
        if (!data || Object.keys(data).length === 0) return null;
        return {
          ...data,
          password: decrypt(data.password as string),
        };
      })
    );

    return NextResponse.json(accounts.filter(Boolean));
  } catch (error) {
    console.error('GET /api/accounts error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const id = randomUUID();
    const now = new Date().toISOString();

    await redis.hset(`account:${id}`, {
      id,
      platform: body.platform,
      accountId: body.accountId,
      password: encrypt(body.password),
      notes: body.notes || '',
      createdAt: now,
      updatedAt: now,
    });

    await redis.zadd('accounts:index', { score: Date.now(), member: id });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/accounts error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
