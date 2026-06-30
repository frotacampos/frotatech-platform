import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  const { descricao_raw } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Você é um assistente de suporte para o sistema LumiCity de gestão de iluminação pública.
Seu papel é melhorar descrições de problemas de iluminação pública enviadas por cidadãos, tornando-as mais claras, objetivas e úteis para os operadores.
Retorne apenas a descrição melhorada, sem explicações adicionais. Máximo 150 palavras.`
      },
      {
        role: "user",
        content: `Melhore esta descrição de problema de iluminação pública: "${descricao_raw}"`
      }
    ]
  });

  return Response.json({ descricao_sugerida: response.choices[0].message.content });
});