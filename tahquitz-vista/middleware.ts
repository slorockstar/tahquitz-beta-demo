import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    // Decodes base64 string
    const [user, pwd] = atob(authValue).split(':');

    // Hardcoded demo credentials: demo / tahquitz2026
    if (user === 'demo' && pwd === 'tahquitz2026') {
      return NextResponse.next();
    }
  }

  // Request authentication
  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// Protect only specific routes
export const config = {
  matcher: ['/demo/:path*', '/portal/:path*'],
};
