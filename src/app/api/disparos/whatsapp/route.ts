import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateVereadorMonthlyMessage,
  sendWhatsAppMessage,
  sanitizePhoneNumber,
} from "@/lib/whatsapp-bridge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vereadorId, phone, previewOnly = false } = body;

    let vereador = null;
    if (vereadorId) {
      vereador = await prisma.vereador.findUnique({
        where: { id: vereadorId },
      });
    }

    if (!vereador) {
      // Pega o vereador top 1 em gastos para teste
      vereador = await prisma.vereador.findFirst({
        orderBy: { rankingGeral: "asc" },
      });
    }

    if (!vereador) {
      return NextResponse.json({ error: "Nenhum vereador encontrado." }, { status: 404 });
    }

    const mensagem = generateVereadorMonthlyMessage({
      nomeParlamentar: vereador.nomeParlamentar,
      partido: vereador.partido,
      custoMes: vereador.totalGastoMes,
      totalAssessores: vereador.totalAssessores,
      totalProjetos: vereador.totalProjetos,
      taxaPresenca: vereador.taxaPresenca,
      custoPorProjeto: vereador.custoPorProjeto,
    });

    if (previewOnly || !phone) {
      return NextResponse.json({
        success: true,
        preview: mensagem,
        vereador: {
          nome: vereador.nomeParlamentar,
          partido: vereador.partido,
          custoMes: vereador.totalGastoMes,
        },
      });
    }

    const result = await sendWhatsAppMessage({
      phone: sanitizePhoneNumber(phone),
      text: mensagem,
      tipo: "EXTRATO_INDIVIDUAL",
    });

    return NextResponse.json({
      success: true,
      dispatch: result,
      preview: mensagem,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
