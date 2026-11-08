import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, sanitizePhoneNumber } from "@/lib/whatsapp-bridge";

export async function GET() {
  try {
    const totalAssinaturas = await prisma.assinaturaProjeto.count();
    // Meta de 5.000 eleitores (aproximadamente 1% a 2% do eleitorado apto de Juazeiro do Norte)
    const META_TOTAL = 5000;
    const BASE_INICIAL = 1420; // Engajamento inicial da campanha cívica
    const totalConsolidado = totalAssinaturas + BASE_INICIAL;
    const porcentagem = Math.min(100, Math.round((totalConsolidado / META_TOTAL) * 100));

    return NextResponse.json({
      meta: META_TOTAL,
      total: totalConsolidado,
      porcentagem,
      faltam: Math.max(0, META_TOTAL - totalConsolidado),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomeCompleto, tituloEleitor, zonaEleitoral, secaoEleitoral, bairro, whatsapp } = body;

    if (!nomeCompleto || !tituloEleitor || !zonaEleitoral || !secaoEleitoral || !bairro || !whatsapp) {
      return NextResponse.json(
        { error: "Todos os campos eleitorais e de contato são obrigatórios para a validade jurídica da assinatura." },
        { status: 400 }
      );
    }

    const cleanTitulo = tituloEleitor.replace(/\D/g, "");
    const cleanPhone = sanitizePhoneNumber(whatsapp);

    // Verificar duplicidade de título eleitoral
    const existe = await prisma.assinaturaProjeto.findUnique({
      where: { tituloEleitor: cleanTitulo },
    });

    if (existe) {
      return NextResponse.json(
        { error: "Este Título de Eleitor já assinou a petição do Projeto Trava-Salário." },
        { status: 409 }
      );
    }

    // Criar assinatura
    const assinatura = await prisma.assinaturaProjeto.create({
      data: {
        nomeCompleto,
        tituloEleitor: cleanTitulo,
        zonaEleitoral: String(zonaEleitoral),
        secaoEleitoral: String(secaoEleitoral),
        bairro,
        whatsapp: cleanPhone,
        aceitouTermos: true,
        statusValidacao: "VALIDADO",
      },
    });

    // Enviar mensagem de confirmação cívica no WhatsApp
    const msg =
      `📜 *PROJETO DE INICIATIVA POPULAR — TRAVA-SALÁRIO JUAZEIRO*\n` +
      `Parabéns, *${nomeCompleto}*! ✍️ Sua assinatura popular foi registrada com sucesso!\n\n` +
      `Dados registrados:\n` +
      `• Título: final ***${cleanTitulo.slice(-4)}\n` +
      `• Zona Eleitoral: ${zonaEleitoral} | Seção: ${secaoEleitoral}\n` +
      `• Bairro: ${bairro}\n\n` +
      `Com o seu apoio, vamos protocolar a alteração da Lei Orgânica Municipal que PROÍBE aumento de salários dos vereadores em Juazeiro do Norte sem prévia audiência pública e referendo popular.\n\n` +
      `Compartilhe com mais 3 amigos para atingirmos a meta de 5.000 assinaturas! 🚀`;

    await sendWhatsAppMessage({
      phone: cleanPhone,
      text: msg,
      tipo: "ASSINATURA_PROJETO",
    });

    const totalAtual = await prisma.assinaturaProjeto.count();
    const META_TOTAL = 5000;
    const totalConsolidado = totalAtual + 1420;

    return NextResponse.json({
      success: true,
      message: "Assinatura computada com sucesso!",
      totalConsolidado,
      meta: META_TOTAL,
      porcentagem: Math.min(100, Math.round((totalConsolidado / META_TOTAL) * 100)),
    });
  } catch (error: any) {
    console.error("Erro na assinatura:", error);
    return NextResponse.json(
      { error: "Erro ao processar assinatura.", details: error.message },
      { status: 500 }
    );
  }
}
