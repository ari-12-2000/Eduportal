// app/api/prisma-test/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await prisma.program.findMany({ take: 1 });
    return NextResponse.json({ ok: true, name: res[0]?.title ?? 'no data' });
  } catch (err) {
    console.error('❌ Prisma test error:', err);
    return NextResponse.json({ error: 'Prisma connection failed' }, { status: 500 });
  }
}
