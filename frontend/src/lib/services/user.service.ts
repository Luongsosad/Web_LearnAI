'use server';

import { cookies } from 'next/headers';

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/a/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': accessToken || '',
        'x-refresh-token': refreshToken || '',
      },
    });

    const data = await res.json();

    return data.user || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
