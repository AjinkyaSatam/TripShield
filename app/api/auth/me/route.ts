import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      // Fall back to first demo user if no cookie yet, for seamless demo continuity
      const defaultUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tier: true,
          company: true,
          phone: true,
          avatar: true,
        },
      });

      return NextResponse.json({
        success: true,
        authenticated: false,
        user: defaultUser,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Session error' },
      { status: 500 }
    );
  }
}
