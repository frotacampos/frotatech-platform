from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(prefix="/ai")


class ChatbotRequest(BaseModel):
    mensagem: str
    historico: list[dict] = []


@router.post("/chatbot")
def chatbot(payload: ChatbotRequest) -> dict[str, str]:
    message = payload.mensagem.lower()
    if "registr" in message or "problema" in message or "chamado" in message:
        resposta = (
            "Para registrar um problema, clique em Registrar Problema, descreva a falha, "
            "informe o endereco e envie uma foto se tiver. Depois voce acompanha tudo pelo "
            "painel do cidadao."
        )
    elif "status" in message or "acompan" in message:
        resposta = (
            "Voce pode acompanhar seus chamados no painel do cidadao, na aba Meus Reportes. "
            "Ali aparecem status, endereco e historico do atendimento."
        )
    elif "foto" in message:
        resposta = (
            "As fotos ajudam a equipe a identificar o ponto e validar a resolucao. Voce pode "
            "anexar foto ao registrar o problema e o operador pode anexar foto da resolucao."
        )
    else:
        resposta = (
            "Sou o assistente LumiCity. Posso ajudar com registro de chamados, acompanhamento, "
            "fotos e duvidas sobre iluminacao publica."
        )
    return {"resposta": resposta}


@router.post("/suggest-description")
def suggest_description(payload: dict) -> dict[str, str]:
    raw = payload.get("descricao_raw") or payload.get("descricao") or ""
    return {
        "descricao_sugerida": raw.strip()
        or "Descreva o problema, o endereco aproximado e quando a falha foi percebida."
    }


@router.post("/classify-priority")
def classify_priority(payload: dict) -> dict[str, str | bool]:
    text = f"{payload.get('descricao', '')} {payload.get('endereco', '')}".lower()
    priority = (
        "alta"
        if any(word in text for word in ["avenida", "risco", "acidente", "poste caido", "escuro"])
        else "media"
    )
    return {
        "prioridade": priority,
        "motivo": "Classificacao local inicial ate integracao com IA externa.",
        "urgente": priority == "alta",
    }


@router.post("/trend-report")
def trend_report(payload: dict) -> dict[str, object]:
    return {
        "resumo": "Relatorio local gerado sem IA externa nesta etapa.",
        "areas_criticas": [],
        "insights": ["Conectar OpenAI API no proximo sprint de IA para analises avancadas."],
        "planos_acao": [],
    }
