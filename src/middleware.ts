import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Landing Page Mode: Pass through everything
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|icon.png).*)',
  ],
};