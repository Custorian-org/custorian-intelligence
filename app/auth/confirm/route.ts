import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  // Forward all params to the callback handler
  const params = searchParams.toString();
  return NextResponse.redirect(`${origin}/auth/callback?${params}`);
}
