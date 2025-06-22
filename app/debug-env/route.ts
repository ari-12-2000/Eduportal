import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    dbUrl: process.env.DATABASE_URL || 'Not Found',
    db_drUrl:process.env.DIRECT_URL || 'Not Found'
  });
}
