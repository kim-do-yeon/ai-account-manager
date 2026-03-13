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

    const announcementIds = await redis.zrange('announcements:index', 0, -1, { rev: true });
    if (!announcementIds || announcementIds.length === 0) {
      return NextResponse.json([]);
    }

    const announcements = await Promise.all(
      announcementIds.map(async (id) => {
        const data = await redis.hgetall(`announcement:${id}`);
        if (!data || Object.keys(data).length === 0) return null;
        return data;
      })
    );

    return NextResponse.json(announcements.filter(Boolean));
  } catch (error) {
    console.error('GET /api/announcements error:', error);
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

    await redis.hset(`announcement:${id}`, {
      id,
      title: body.title,
      content: body.content,
      createdAt: now,
      updatedAt: now,
    });

    await redis.zadd('announcements:index', { score: Date.now(), member: id });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/announcements error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
