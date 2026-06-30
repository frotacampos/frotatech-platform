import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Busca todos os chamados
  const chamados = await base44.asServiceRole.entities.Reporte.list("-data_criacao", 500);

  const resumo = chamados.map(c => ({
    id: c.id?.slice(-6),
    status: c.status,
    descricao: c.descricao?.slice(0, 120),
    endereco: c.endereco || "",
    cidade: c.cidade_nome || "",
    latitude: c.latitude,
    longitude: c.longitude,
    criado: c.data_criacao || c.created_date,
    resolvido: c.data_resolucao || null,
    operador: c.operador_nome || "Sem responsável",
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Você é um especialista em gestão urbana e análise de dados de iluminação pública.
Analise os chamados fornecidos e gere um relatório completo de tendências em português.
Retorne um JSON com a seguinte estrutura:
{
  "resumo_executivo": "string (3-4 frases)",
  "total_chamados": number,
  "taxa_resolucao": "string (percentual)",
  "tempo_medio_resolucao": "string",
  "areas_criticas": [{ "area": "string", "quantidade": number, "descricao": "string" }],
  "tendencias": ["string"],
  "planos_acao": [{ "titulo": "string", "prioridade": "alta|media|baixa", "descricao": "string", "impacto": "string" }],
  "pontos_positivos": ["string"],
  "alertas": ["string"]
}`
      },
      {
        role: "user",
        content: `Gere um relatório de tendências completo para ${chamados.length} chamados de iluminação pública:\n${JSON.stringify(resumo)}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const resultado = JSON.parse(response.choices[0].message.content);
  return Response.json({ ...resultado, gerado_em: new Date().toISOString(), total_processado: chamados.length });
});