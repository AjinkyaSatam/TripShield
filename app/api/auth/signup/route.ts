import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, createDatabaseSession, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password, company, tier = 'Diamond Shield VIP', phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashPassword(password),
        role: 'TRAVELER',
        company: company?.trim() || 'Enterprise Member',
        tier,
        phone: phone?.trim() || null,
      },
    });

    await createDatabaseSession(user.id);
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tier: user.tier,
    });

    await setAuthCookie(token);

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error signing up:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration error' },
      { status: 500 }
    );
  }
}
