import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Session kadaluarsa, silakan login ulang (Unauthorized)' }, { status: 401 });
  }

  try {
    const { messages, test, apiKey: bodyApiKey, provider: bodyProvider, model: bodyModel } = await req.json();

    let apiKey = bodyApiKey;
    let provider = bodyProvider;
    let model = bodyModel;
    let userContext = "";

    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!apiKey) {
      if (!settings || !settings.aiApiKeyEncrypted) {
        return NextResponse.json({ success: false, error: 'AI belum di-setup di Settings' }, { status: 400 });
      }

      apiKey = decrypt(settings.aiApiKeyEncrypted);
      provider = provider || settings.aiProvider;
      model = model || settings.aiModel;
    }

    if (!model && provider !== 'custom') {
      return NextResponse.json({ success: false, error: 'Model AI belum dipilih! Silakan pilih model di dropdown.' }, { status: 400 });
    }

    // If it's a test, we continue to the provider logic below to verify the real API
    if (test) {
      if (!apiKey) return NextResponse.json({ success: false, error: 'API Key missing' }, { status: 400 });
      // We will skip the heavy database lookups for a simple connection test
    } else {
      // Fetch user context for system prompt
      const [user, investments, tasks, transactions, debts] = await Promise.all([
        prisma.user.findUnique({ where: { id: session.user.id } }),
        prisma.financeInvestment.findMany({ where: { userId: session.user.id } }),
        prisma.course.findMany({ where: { userId: session.user.id } }),
        prisma.financeTransaction.findMany({ 
          where: { 
            userId: session.user.id,
            date: {
               gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          } 
        }),
        prisma.financeDebt.findMany({ where: { userId: session.user.id, status: 'aktif' } })
      ]);

      const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const remaining = income - expense;

      const today = new Date().toLocaleDateString('id-ID');
      
      userContext = `Kamu adalah asisten pribadi untuk ${user?.name || 'User'}.
DATA PENGGUNA SAAT INI:

Nama: ${user?.name || 'User'}
Tanggal hari ini: ${today}

PORTOFOLIO SAHAM AKTIF:
${investments.map(i => `- ${i.name}: ${i.lots || 0} lot`).join('\n')}

MATA KULIAH HARI INI:
${tasks.map(t => `- ${t.courseName} (${t.startTime}-${t.endTime})`).join('\n')}

RINGKASAN KEUANGAN BULAN INI:
Pemasukan: Rp ${income.toLocaleString('id-ID')}
Pengeluaran: Rp ${expense.toLocaleString('id-ID')}
Sisa budget: Rp ${remaining.toLocaleString('id-ID')}

Kamu bisa membantu analisis saham, manajemen keuangan, pengingat jadwal kuliah, dan pertanyaan umum. Jawab dalam Bahasa Indonesia.`;
    }

    const systemPrompt = test ? "You are a connection test. Reply with OK." : userContext;
    const finalMessages = test ? [{ role: 'user', content: 'hi' }] : messages;

    // Forward to provider
    let aiResponse = '';

    if (['openai', 'openrouter', 'groq', 'mistral', 'together', 'cohere'].includes(provider || '')) {
      let baseUrl = '';
      switch(provider) {
        case 'openai': baseUrl = 'https://api.openai.com/v1'; break;
        case 'openrouter': baseUrl = 'https://openrouter.ai/api/v1'; break;
        case 'groq': baseUrl = 'https://api.groq.com/openai/v1'; break;
        case 'mistral': baseUrl = 'https://api.mistral.ai/v1'; break;
        case 'together': baseUrl = 'https://api.together.xyz/v1'; break;
        case 'cohere': baseUrl = 'https://api.cohere.ai/v1'; break;
      }

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/Stitch-AI/Planning',
          'X-Title': 'Planning Dashboard'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...finalMessages
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      aiResponse = data.choices[0].message.content;

    } else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          system: systemPrompt,
          messages: finalMessages,
          max_tokens: 1024
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.error?.message || data.error || JSON.stringify(data);
        throw new Error(detail);
      }
      aiResponse = data.content[0].text;

    } else if (provider === 'google') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: (systemPrompt ? systemPrompt + "\n\n" : "") + "User message: " + finalMessages[finalMessages.length-1].content }] }
          ]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.error?.message || data.error || JSON.stringify(data);
        throw new Error(detail);
      }
      aiResponse = data.candidates[0].content.parts[0].text;

    } else if (provider === 'custom' && settings) {
      const bodyStr = settings.customAiBodyTemplate || '{"prompt": "{prompt}"}';
      const body = JSON.parse(bodyStr.replace('{prompt}', JSON.stringify(finalMessages[finalMessages.length-1].content)));
      
      const res = await fetch(settings.customAiEndpoint || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [settings.customAiHeaderName || 'Authorization']: `${settings.customAiHeaderPrefix || 'Bearer'} ${apiKey}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      aiResponse = data.response || data.text || JSON.stringify(data);
    }

    return NextResponse.json({ success: true, data: { content: aiResponse } });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
