import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { chamados } = await req.json();

  const resumo = chamados.map(c => ({
    id: c.id?.slice(-6),
    status: c.status,
    descricao: c.descricao?.slice(0, 100),
    endereco: c.endereco,
    cidade: c.cidade_nome,
    criado: c.data_criacao || c.created_date,
    resolvido: c.data_resolucao,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Você é um analista de dados especialista em gestão de iluminação pública urbana.
Analise os dados de chamados fornecidos e gere insights concisos em português.
Retorne um JSON com: { insights: string[], regioes_criticas: string[], recomendacoes: string[], resumo_executivo: string }`
      },
      {
        role: "user",
        content: `Analise estes ${chamados.length} chamados de iluminação pública e gere insights:\n${JSON.stringify(resumo)}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const resultado = JSON.parse(response.choices[0].message.content);
  return Response.json(resultado);
});