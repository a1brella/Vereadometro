import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, sanitizePhoneNumber } from "@/lib/whatsapp-bridge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, whatsapp, ddd = "88", bairro, email, vereadoresIds = [], seguirTodos = false } = body;

    if (!nome || !whatsapp || !bairro) {
      return NextResponse.json(
        { error: "Nome, WhatsApp e Bairro são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizePhoneNumber(whatsapp);

    // Salvar ou atualizar o Lead
    const lead = await prisma.lead.upsert({
      where: { whatsapp: cleanPhone },
      update: {
        nome,
        ddd,
        bairro,
        email: email || null,
        optinWhatsapp: true,
        optinAlertasBairro: true,
      },
      create: {
        nome,
        whatsapp: cleanPhone,
        ddd,
        bairro,
        email: email || null,
        optinWhatsapp: true,
        optinAlertasBairro: true,
      },
    });

    // Limpar inscrições anteriores para renovar seleção
    await prisma.inscricaoAlerta.deleteMany({
      where: { leadId: lead.id },
    });

    if (seguirTodos) {
      // Inscrição para seguir todos os vereadores
      await prisma.inscricaoAlerta.create({
        data: {
          leadId: lead.id,
          seguirTodos: true,
          ativo: true,
        },
      });
    } else if (Array.isArray(vereadoresIds) && vereadoresIds.length > 0) {
      // Inscrições individuais
      for (const vId of vereadoresIds) {
        await prisma.inscricaoAlerta.create({
          data: {
            leadId: lead.id,
            vereadorId: vId,
            seguirTodos: false,
            ativo: true,
          },
        });
      }
    } else {
      // Default para seguir todos se nenhum específico foi passado
      await prisma.inscricaoAlerta.create({
        data: {
          leadId: lead.id,
          seguirTodos: true,
          ativo: true,
        },
      });
    }

    // Mensagem de Boas-Vindas no WhatsApp
    const saudacaoMsg =
      `🏛️ *VEREADÔMETRO JUAZEIRO DO NORTE*\n` +
      `Olá, *${nome}*! ✅ Sua inscrição de fiscalização cidadã foi confirmada com sucesso.\n\n` +
      `Você receberá extratos mensais transparentes sobre os gastos de gabinete, assessores e projetos dos vereadores de Juazeiro do Norte.\n\n` +
      `Bairro cadastrado: *${bairro}*\n` +
      `Obrigado por ajudar a fiscalizar cada centavo do dinheiro do nosso povo! 🔍`;

    const dispatchResult = await sendWhatsAppMessage({
      phone: cleanPhone,
      text: saudacaoMsg,
      leadId: lead.id,
      tipo: "CONFIRMACAO_INSCRICAO",
    });

    // Registrar no log
    await prisma.disparoLog.create({
      data: {
        leadId: lead.id,
        tipo: "CONFIRMACAO_INSCRICAO",
        canal: "WHATSAPP",
        destino: cleanPhone,
        payloadMensagem: saudacaoMsg,
        statusEnvio: dispatchResult.mode === "BRIDGE_SENT" ? "ENVIADO" : "SIMULADO",
        respostaApi: JSON.stringify(dispatchResult),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Inscrição realizada com sucesso! Você receberá os alertas pelo WhatsApp.",
      leadId: lead.id,
      dispatch: dispatchResult,
    });
  } catch (error: any) {
    console.error("Erro na rota de leads:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar inscrição.", details: error.message },
      { status: 500 }
    );
  }
}
