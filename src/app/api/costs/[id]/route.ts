import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
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

    await redis.hset(`cost:${id}`, {
      platform: body.platform,
      period: body.period,
      amount: body.amount,
      notes: body.notes || '',
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/costs/[id] error:', error);
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
    await redis.del(`cost:${id}`);
    await redis.zrem('costs:index', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/costs/[id] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
