import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.userSettings.create({
        data: { userId: session.user.id },
      });
    }

    // Decrypt sensitive data for the settings UI
    const responseData = {
      ...settings,
      aiApiKey: settings.aiApiKeyEncrypted ? decrypt(settings.aiApiKeyEncrypted) : '',
      telegramBotToken: settings.telegramBotTokenEncrypted ? decrypt(settings.telegramBotTokenEncrypted) : '',
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      aiProvider, 
      aiModel, 
      aiApiKey, 
      telegramBotToken, 
      telegramChatId,
      notifMorningSummary,
      notifStockDropPct,
      notifStockRisePct,
      notifDebtReminderDays,
      notifBudgetThresholdPct,
      notifSavingReminder,
      notifTelegramAiChat,
      customAiEndpoint,
      customAiHeaderName,
      customAiHeaderPrefix,
      customAiBodyTemplate
    } = body;

    const updateData: any = {
      aiProvider,
      aiModel,
      telegramChatId,
      notifMorningSummary,
      notifStockDropPct: parseFloat(notifStockDropPct),
      notifStockRisePct: parseFloat(notifStockRisePct),
      notifDebtReminderDays: parseInt(notifDebtReminderDays),
      notifBudgetThresholdPct: parseInt(notifBudgetThresholdPct),
      notifSavingReminder,
      notifTelegramAiChat,
      customAiEndpoint,
      customAiHeaderName,
      customAiHeaderPrefix,
      customAiBodyTemplate
    };

    if (aiApiKey !== undefined) {
      updateData.aiApiKeyEncrypted = encrypt(aiApiKey);
    }

    if (telegramBotToken !== undefined) {
      updateData.telegramBotTokenEncrypted = encrypt(telegramBotToken);
    }

    const updated = await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
