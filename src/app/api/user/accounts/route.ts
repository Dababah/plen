import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        scope: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      accounts: accounts 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
