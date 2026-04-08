import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || !message.text || !message.chat) {
       return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id.toString();
    const userText = message.text;

    // Find user settings matching this chat ID
    const settings = await prisma.userSettings.findFirst({
        where: { telegramChatId: chatId, notifTelegramAiChat: true },
        include: { user: true }
    });

    if (!settings || !settings.aiApiKeyEncrypted) {
        return NextResponse.json({ ok: true });
    }

    const token = decrypt(settings.telegramBotTokenEncrypted!);
    
    // Send "typing..." status
    await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, action: 'typing' })
    });

    // Call AI Logic (Refactored from /api/ai/chat)
    // For simplicity, we'll call the internal AI API or duplicate the logic if needed.
    // Given the constraints, I'll use a simplified fetch to its own server if possible, 
    // or just re-implement a minimal version.
    
    // Note: Re-implementing system prompt and context fetch for Telegram
    const [investments, tasks, transactions, debts] = await Promise.all([
      prisma.financeInvestment.findMany({ where: { userId: settings.userId } }),
      prisma.task.findMany({ where: { userId: settings.userId } }),
      prisma.financeTransaction.findMany({ 
        where: { 
          userId: settings.userId,
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        } 
      }),
      prisma.financeDebt.findMany({ where: { userId: settings.userId, status: 'aktif' } })
    ]);

    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const today = new Date().toLocaleDateString('id-ID');
    
    const systemPrompt = `Kamu adalah asisten pribadi Telegram untuk ${settings.user.name}.
Tanggal: ${today}

Investasi: ${investments.length} emiten
Keuangan: Pemasukan Rp ${income.toLocaleString('id-ID')}, Pengeluaran Rp ${expense.toLocaleString('id-ID')}
Tasks Hari Ini: ${tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length} belum selesai

Gunakan data ini untuk menjawab singkat dan padat via Telegram.`;

    const apiKey = decrypt(settings.aiApiKeyEncrypted);
    const provider = settings.aiProvider;
    const model = settings.aiModel;

    let aiResponse = "Maaf, asisten AI sedang sibuk.";

    try {
        if (provider === 'openai' || provider === 'openrouter') {
             const baseUrl = provider === 'openai' ? 'https://api.openai.com/v1' : 'https://openrouter.ai/api/v1';
             const aiRes = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                  model: model,
                  messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText }
                  ]
                })
             });
             const data = await aiRes.json();
             aiResponse = data.choices[0].message.content;
        } else if (provider === 'google') {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\nUser: " + userText }] }] })
            });
            const data = await res.json();
            aiResponse = data.candidates[0].content.parts[0].text;
        }
    } catch (e) {
        aiResponse = "Gagal memproses permintaan AI.";
    }

    // Reply to Telegram
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: aiResponse,
        parse_mode: 'Markdown'
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
