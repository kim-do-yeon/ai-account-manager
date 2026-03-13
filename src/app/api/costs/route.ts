import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getSessionFromCookies } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const costIds = await redis.zrange('costs:index', 0, -1);
    if (!costIds || costIds.length === 0) {
      return NextResponse.json([]);
    }

    const costs = await Promise.all(
      costIds.map(async (id) => {
        const data = await redis.hgetall(`cost:${id}`);
        if (!data || Object.keys(data).length === 0) return null;
        return data;
      })
    );

    return NextResponse.json(costs.filter(Boolean));
  } catch (error) {
    console.error('GET /api/costs error:', error);
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

    await redis.hset(`cost:${id}`, {
      id,
      platform: body.platform,
      period: body.period,
      amount: body.amount,
      notes: body.notes || '',
      createdAt: now,
      updatedAt: now,
    });

    await redis.zadd('costs:index', { score: Date.now(), member: id });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/costs error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
