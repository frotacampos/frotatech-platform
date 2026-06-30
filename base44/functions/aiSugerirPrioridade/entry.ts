import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  const { descricao, endereco } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Você é um especialista em gestão de iluminação pública urbana.
Analise a descrição de um problema e classifique sua prioridade.
Retorne JSON: { "prioridade": "alta|media|baixa", "motivo": "string (1 frase)", "urgente": boolean }`
      },
      {
        role: "user",
        content: `Problema: "${descricao}". Local: "${endereco || 'não informado'}". Qual a prioridade?`
      }
    ],
    response_format: { type: "json_object" }
  });

  return Response.json(JSON.parse(response.choices[0].message.content));
});