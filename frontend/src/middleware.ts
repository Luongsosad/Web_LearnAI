import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export default async function middleware(request: NextRequest) {
  console.log('Middleware');
  const cookieStore = await cookies();
  const deviceId = request.cookies.get('device_id')?.value;
  let accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const pathname = request.nextUrl.pathname;

  console.log(accessToken);
  if (!deviceId) {
    if (!['/login', '/register'].includes(pathname)) {
      console.log('No device id, redirect to login');
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return; // test

  // Try to refresh the access token if it doesn't exist
  if (!accessToken && refreshToken) {
    const cookieHeader = `refresh_token=${refreshToken}`;
    console.log(cookieHeader);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        credentials: 'include',
      });
      const result = await response.json();

      console.log('Response from API:', result);

      if (result?.data?.accessToken) {
        accessToken = result.data.accessToken;
        // tạo phản hồi mới để set cookie
        cookieStore.set('access_token', result.data.accessToken, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          expires: new Date(Date.now() + 60 * 60 * 1000),
        });
      }
    } catch (error) {
      console.error('Error in middleware:', error);
    }
  }

  if (!accessToken) {
    console.log(pathname);
    if (pathname.startsWith('/staff') && !['/staff/login', '/staff/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/staff/login', request.url));
    }
    if (
      pathname.startsWith('/display') &&
      !['/display/login', '/display/register'].includes(pathname)
    ) {
      return NextResponse.redirect(new URL('/display/login', request.url));
    }
  }

  // check role
  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(accessToken || '', secret); //as { payload: JWTPayload };

      const role = payload.role;
      console.log('role:', role);

      if (role && pathname.startsWith('/staff') && role !== 'staff' && role !== 'admin') {
        return NextResponse.redirect(new URL('/display', request.url));
      }
    } catch (e) {
      console.error('JWT verify failed:', e);
      // INVALID_TOKEN --> Login
      if (
        pathname.startsWith('/staff') &&
        !['/staff/login', '/staff/register'].includes(pathname)
      ) {
        return NextResponse.redirect(new URL('/staff/login', request.url));
      }
      if (
        pathname.startsWith('/display') &&
        !['/display/login', '/display/register'].includes(pathname)
      ) {
        return NextResponse.redirect(new URL('/display/login', request.url));
      }
      // Không redirect với các trang login/register
      return NextResponse.next();
    }

    if (pathname.startsWith('/staff') && ['/staff/login', '/staff/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/staff', request.url));
    }
    if (
      pathname.startsWith('/display') &&
      ['/display/login', '/display/register'].includes(pathname)
    ) {
      return NextResponse.redirect(new URL('/display', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // matcher: [
  //   '/chat((?!_next|.*\\..*).*)',
  //   '/conversation((?!_next|.*\\..*).*)',
  //   '/pronunciation((?!_next|.*\\..*).*)',
  //   '/flashcards((?!_next|.*\\..*).*)',
  //   '/bilingual-stories((?!_next|.*\\..*).*)',
  //   '/quiz((?!_next|.*\\..*).*)',
  //   "/"
  // ],
  matcher: [
    '/account/:path*',
    '/chat/:path*',
    '/conversation/:path*',
    '/pronunciation/:path*',
    '/flashcards/:path*',
    '/bilingual-stories/:path*',
    '/quiz/:path*',
    '/',
  ],
};
