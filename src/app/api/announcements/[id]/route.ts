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

    await redis.hset(`announcement:${id}`, {
      title: body.title,
      content: body.content,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/announcements/[id] error:', error);
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
    await redis.del(`announcement:${id}`);
    await redis.zrem('announcements:index', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/announcements/[id] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
