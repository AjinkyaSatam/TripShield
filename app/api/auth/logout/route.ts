import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Logout error' },
      { status: 500 }
    );
  }
}
