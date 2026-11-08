export interface SendMessageOptions {
  phone: string; // ex: "5588999998888" or "88999998888"
  text: string;
  leadId?: string;
  tipo?: string;
}

export function sanitizePhoneNumber(phone: string): string {
  // Remove non-numeric characters
  const clean = phone.replace(/\D/g, "");
  // If already starts with 55 and length 12-13
  if (clean.startsWith("55") && clean.length >= 12) {
    return clean;
  }
  // If Brazilian format with DDD (10 or 11 digits), prepend 55
  if (clean.length === 10 || clean.length === 11) {
    return `55${clean}`;
  }
  return clean;
}

export function generateVereadorMonthlyMessage(params: {
  nomeParlamentar: string;
  partido: string;
  custoMes: number;
  totalAssessores: number;
  totalProjetos: number;
  taxaPresenca: number;
  custoPorProjeto: number;
  siteUrl?: string;
}): string {
  const url = params.siteUrl || "https://vereadometro-juazeiro.com.br";
  const custoFormatado = params.custoMes.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const custoProjetoFormatado =
    params.totalProjetos > 0
      ? params.custoPorProjeto.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "R$ 0,00 (Nenhum projeto apresentado)";

  return (
    `🏛️ *VEREADÔMETRO JUAZEIRO DO NORTE / CE*\n` +
    `📢 *EXTRATO DE FISCALIZAÇÃO DO SEU VEREADOR*\n\n` +
    `👤 *Vereador:* ${params.nomeParlamentar} (${params.partido})\n` +
    `💰 *Custo no Mês:* ${custoFormatado}\n` +
    `👥 *Assessores no Gabinete:* ${params.totalAssessores} contratados\n` +
    `📄 *Projetos Apresentados:* ${params.totalProjetos}\n` +
    `⚠️ *Custo por Projeto:* ${custoProjetoFormatado}\n` +
    `📊 *Presença nas Sessões:* ${params.taxaPresenca}%\n\n` +
    `🚨 *Você está pagando caro pelo trabalho dos seus representantes! Compartilhe com seus vizinhos:*\n` +
    `👉 ${url}\n\n` +
    `_Fiscalização Cívica Independente financiada pela comunidade do Cariri._`
  );
}

export async function sendWhatsAppMessage(options: SendMessageOptions) {
  const bridgeUrl = process.env.WHATSAPP_BRIDGE_URL || "http://127.0.0.1:8089/api/send-message";
  const formattedPhone = sanitizePhoneNumber(options.phone);

  const payload = {
    phone: formattedPhone,
    message: options.text,
    chatId: `${formattedPhone}@s.whatsapp.net`,
  };

  try {
    // Attempt local bridge request with 3s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(bridgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        mode: "BRIDGE_SENT",
        data,
      };
    } else {
      const errText = await response.text();
      return {
        success: false,
        mode: "BRIDGE_ERROR",
        error: errText,
      };
    }
  } catch (error: any) {
    // Graceful fallback for local development or when bridge is offline
    console.warn(`[WhatsApp Bridge] Ponte local offline na porta 8089. Mensagem registrada em modo SIMULADO: ${error.message}`);
    return {
      success: true,
      mode: "SIMULATED_SUCCESS",
      simulated: true,
      messagePreview: options.text,
      phone: formattedPhone,
    };
  }
}
