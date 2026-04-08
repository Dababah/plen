import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

// Helper to send telegram
async function sendTelegram(userId: string, text: string) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings || !settings.telegramBotTokenEncrypted || !settings.telegramChatId) return;

  const token = decrypt(settings.telegramBotTokenEncrypted);
  const chatId = settings.telegramChatId;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    }),
  });
}

// 1. Morning Summary (07:00 AM)
cron.schedule('0 7 * * *', async () => {
    const usersWithSummary = await prisma.userSettings.findMany({
        where: { notifMorningSummary: true },
        include: { user: true }
    });

    for (const setting of usersWithSummary) {
        const [tasks, debts] = await Promise.all([
            prisma.task.findMany({ 
                where: { userId: setting.userId, dueDate: new Date().toISOString() } 
            }),
            prisma.financeDebt.findMany({ 
                where: { userId: setting.userId, status: 'aktif' } 
            })
        ]);

        let message = `🌅 *Selamat Pagi, ${setting.user.name}!*\n\nRingkasan hari ini:\n`;
        
        if (tasks.length > 0) {
            message += `\n✅ *Tasks Hari Ini:*\n${tasks.map(t => `- ${t.title}`).join('\n')}`;
        } else {
            message += `\n📭 Tidak ada task hari ini.`;
        }

        if (debts.length > 0) {
            message += `\n\n💳 *Cicilan Aktif:*\n${debts.map(d => `- ${d.name}: Rp ${d.monthlyPayment.toLocaleString('id-ID')} (Tgl ${d.dueDayOfMonth})`).join('\n')}`;
        }

        await sendTelegram(setting.userId, message);
    }
});

// 2. Debt Reminders (Check every day at 09:00 AM)
cron.schedule('0 9 * * *', async () => {
    const users = await prisma.userSettings.findMany({
        where: { notifDebtReminderDays: { gt: 0 } }
    });

    for (const setting of users) {
        const today = new Date();
        const dueDayInN = new Date();
        dueDayInN.setDate(today.getDate() + setting.notifDebtReminderDays);
        
        const dayToRemind = dueDayInN.getDate();
        
        const upcomingDebts = await prisma.financeDebt.findMany({
            where: { 
                userId: setting.userId, 
                status: 'aktif',
                dueDayOfMonth: dayToRemind
            }
        });

        for (const debt of upcomingDebts) {
            const message = `🔔 *Pengingat Cicilan!*\n\nCicilan *${debt.name}* sebesar Rp ${debt.monthlyPayment.toLocaleString('id-ID')} akan jatuh tempo dalam ${setting.notifDebtReminderDays} hari (Tgl ${debt.dueDayOfMonth}).`;
            await sendTelegram(setting.userId, message);
        }
    }
});

// 3. Stock Price Alerts (Check every hour during market hours)
// This is a placeholder since we need to loop through investments and call external API.
// In a real environment, this would call /api/finance/stock-price internally.
cron.schedule('0 * * * 1-5', async () => {
    // Logic for stock price alerts (Placeholder)
    // - Fetch all investments where user has alerts on
    // - Call Yahoo Finance API
    // - Compare with buy price or prev close
    // - Send telegram if threshold exceeded
});

console.log("🚀 Cron jobs initialized.");
