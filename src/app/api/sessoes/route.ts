import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessoes = await prisma.sessaoPlenaria.findMany({
      orderBy: { dataSessao: "desc" },
      take: 6,
    });

    const parsed = sessoes.map((s) => ({
      id: s.id,
      videoId: s.videoId,
      numeroSessao: s.numeroSessao || "Sessão Plenária",
      tipoSessao: s.tipoSessao || "ORDINARIA",
      titulo: s.titulo,
      dataSessao: s.dataSessao,
      dataFormatada: s.dataFormatada || "Outubro de 2026",
      horario: s.horario || "09:00",
      youtubeUrl: s.youtubeUrl,
      resumo: s.resumo,
      totalFalas: s.totalFalas,
      vereadoresPresentes: s.vereadoresPresentes ? JSON.parse(s.vereadoresPresentes) : [],
      temasDiscutidos: s.temasDiscutidos ? JSON.parse(s.temasDiscutidos) : [],
    }));

    return NextResponse.json({
      success: true,
      sessoes: parsed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
