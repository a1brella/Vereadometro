import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sessao = await prisma.sessaoPlenaria.findFirst({
      where: {
        OR: [{ id }, { videoId: id }],
      },
    });

    if (!sessao) {
      return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
    }

    const transcricao = sessao.transcricaoJson ? JSON.parse(sessao.transcricaoJson) : [];
    const temas = sessao.temasDiscutidos ? JSON.parse(sessao.temasDiscutidos) : [];
    const vereadores = sessao.vereadoresPresentes ? JSON.parse(sessao.vereadoresPresentes) : [];

    return NextResponse.json({
      success: true,
      sessao: {
        id: sessao.id,
        videoId: sessao.videoId,
        numeroSessao: sessao.numeroSessao || "Sessão Plenária",
        tipoSessao: sessao.tipoSessao || "ORDINARIA",
        titulo: sessao.titulo,
        dataSessao: sessao.dataSessao,
        dataFormatada: sessao.dataFormatada || "Outubro de 2026",
        horario: sessao.horario || "09:00",
        youtubeUrl: sessao.youtubeUrl,
        resumo: sessao.resumo,
        totalFalas: sessao.totalFalas,
        vereadoresPresentes: vereadores,
        temasDiscutidos: temas,
        transcricao,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
