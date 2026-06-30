import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  const { mensagem, historico = [] } = await req.json();

  const messages = [
    {
      role: "system",
      content: `Você é o assistente virtual do LumiCity, uma plataforma de gestão de iluminação pública urbana.
Ajude os cidadãos a:
- Entender como registrar problemas de iluminação
- Acompanhar o status de seus reportes
- Tirar dúvidas sobre o sistema
- Orientar sobre situações de emergência relacionadas à iluminação pública

Seja simpático, direto e use linguagem acessível. Máximo 100 palavras por resposta.
Se for uma emergência de risco à vida, oriente a ligar para o SAMU (192) ou Bombeiros (193).`
    },
    ...historico,
    { role: "user", content: mensagem }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 200,
  });

  return Response.json({ resposta: response.choices[0].message.content });
});