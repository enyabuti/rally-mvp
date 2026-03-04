import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    keyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 15) || 'NOT_FOUND',
    keyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC')),
  });
}
