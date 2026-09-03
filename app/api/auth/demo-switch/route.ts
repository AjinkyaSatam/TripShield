import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, createDatabaseSession, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Demo user not found' },
        { status: 404 }
      );
    }

    await createDatabaseSession(user.id);
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tier: user.tier,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        company: user.company,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Error in demo switch:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error switching persona' },
      { status: 500 }
    );
  }
}
