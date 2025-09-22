'use server';

import { cookies } from 'next/headers';

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    console.log('Access Token in getUser:', accessToken);
    console.log('Refresh Token in getUser:', refreshToken);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/a/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': accessToken || '',
        'x-refresh-token': refreshToken || '',
      },
    });

    console.log('Fetch user response status:', res);

    const data = await res.json();

    console.log('Fetched user data:', data);

    return data.user || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
