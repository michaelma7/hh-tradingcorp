import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { hierarchy } from './rbac/permissions';

export async function proxy(request: NextRequest) {
  const role = request.cookies.get('rbac')?.value ?? 'user';
  const session = request.cookies.get('session')?.value ?? null;
  // remove ability to register
  if (request.nextUrl.pathname.startsWith('/register'))
    return NextResponse.redirect(new URL('/', request.url));

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!request.cookies.has('session') || !session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/users') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
