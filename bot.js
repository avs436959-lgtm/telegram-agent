import { Telegraf } from 'telegraf';
import Groq from 'groq-sdk';

const bot = new Telegraf(process.env.BOT_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sessions = new Map();

bot.start((ctx) => {
  sessions.delete(ctx.from.id);
  ctx.reply('Selam kanka! Artık bahanemiz yok, ne istiyorsan çözeriz. Kime ne yazılacaksa emrine amaneyim! 🚀');
});

bot.command('temizle', (ctx) => {
  sessions.delete(ctx.from.id);
  ctx.reply('Hafızayı sıfırladım, tertemiz bir sayfadan devam edelim! 🧹✨');
});

bot.on('text', async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    const userId = ctx.from.id;
    const userMessage = ctx.message.text;

    if (!sessions.has(userId)) {
      sessions.set(userId, [
        { 
          role: 'system', 
          content: 'Sen samimi, sıcakkanlı ve arkadaş canlısı bir Türk genci gibisin. Asla robot gibi resmi ve soğuk konuşma. Telegram\'ın güvenlik kuralları yüzünden doğrudan telefon rehberindeki kişilere veya Telegram kişilerine otomatik erişimin yok. Ancak kullanıcı senden birine mesaj yazmanı veya birine ulaşmanı isterse, asla "yapamam" diyerek kestirip atma! Durumu kankaya yakışır bir dille tatlıya bağla: "Kanka Telegram güvenlik duvarı yüzünden rehberine direkt daldırtmıyor ama sen bana kişinin adını ve ne yazacağımızı söyle, ben metni en kral şekilde hazırlayayım, tek tıkla kopyalayıp at" de. Çeviri, mesaj taslağı veya herhangi bir iletişim işinde asla "yapamam" kelimesini kullanma, hep pratik bir alternatif sun.' 
        }
      ]);
    }

    const history = sessions.get(userId);
    history.push({ role: 'user', content: userMessage });

    const systemPrompt = history[0];
    const recentMessages = history.slice(1).slice(-10);
    const optimizedHistory = [systemPrompt, ...recentMessages];

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: optimizedHistory,
    });

    const botReply = completion.choices[0].message.content;
    history.push({ role: 'assistant', content: botReply });

    await ctx.reply(botReply, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Hata oluştu:', error.message);
    ctx.reply('Küçük bir teknik aksaklık oldu kanka, soruyu biraz daha net sorarsan hemen hallederiz! 💪');
  }
});

bot.launch();
console.log('Bot rehber engeli taktiğiyle güncellendi...');