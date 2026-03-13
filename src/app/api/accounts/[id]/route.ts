import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { encrypt } from '@/lib/crypto';
import { getSessionFromCookies } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    const existing = await redis.hgetall(`account:${id}`);
    if (!existing || Object.keys(existing).length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await redis.hset(`account:${id}`, {
      platform: body.platform,
      accountId: body.accountId,
      password: encrypt(body.password),
      notes: body.notes || '',
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/accounts/[id] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await redis.del(`account:${id}`);
    await redis.zrem('accounts:index', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/accounts/[id] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
