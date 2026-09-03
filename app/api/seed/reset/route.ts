import { NextResponse } from 'next/server';
import { resetAndSeedDatabase } from '@/lib/seedData';

export async function POST() {
  try {
    const trip = await resetAndSeedDatabase();
    return NextResponse.json({
      success: true,
      message: 'Demo itinerary reset to pristine initial state',
      trip,
    });
  } catch (error: any) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset database' },
      { status: 500 }
    );
  }
}
