import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, cpf, data_nascimento, nome, telefone, email, perfil } = body;

    const cpfLimpo = (cpf || "").replace(/\D/g, "");

    if (action === "cadastrar") {
      if (!cpfLimpo || !data_nascimento || !nome) {
        return Response.json({ error: "CPF, data de nascimento e nome são obrigatórios." }, { status: 400 });
      }

      // Verificar se CPF já existe
      const existentes = await base44.asServiceRole.entities.CidadaoCadastro.filter({ cpf: cpfLimpo });
      if (existentes.length > 0) {
        return Response.json({ error: "CPF já cadastrado no sistema." }, { status: 409 });
      }

      const novo = await base44.asServiceRole.entities.CidadaoCadastro.create({
        nome: nome.trim(),
        cpf: cpfLimpo,
        data_nascimento,
        telefone: (telefone || "").replace(/\D/g, ""),
        email: email?.trim() || "",
        ativo: true,
        perfil: perfil || "cidadao",
      });

      return Response.json({
        success: true,
        cidadao: {
          id: novo.id,
          nome: novo.nome,
          cpf: novo.cpf,
          data_nascimento: novo.data_nascimento,
        }
      });
    }

    if (action === "login") {
      if (!cpfLimpo || !data_nascimento) {
        return Response.json({ error: "CPF e data de nascimento são obrigatórios." }, { status: 400 });
      }

      const encontrados = await base44.asServiceRole.entities.CidadaoCadastro.filter({ cpf: cpfLimpo });
      if (encontrados.length === 0) {
        return Response.json({ error: "CPF não encontrado. Verifique seus dados ou cadastre-se." }, { status: 404 });
      }

      const cidadao = encontrados[0];
      if (!cidadao.ativo) {
        return Response.json({ error: "Cadastro inativo. Entre em contato com a prefeitura." }, { status: 403 });
      }

      if (cidadao.data_nascimento !== data_nascimento) {
        return Response.json({ error: "Data de nascimento incorreta." }, { status: 401 });
      }

      return Response.json({
        success: true,
        cidadao: {
          id: cidadao.id,
          nome: cidadao.nome,
          cpf: cidadao.cpf,
          data_nascimento: cidadao.data_nascimento,
          telefone: cidadao.telefone,
          email: cidadao.email,
        }
      });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});