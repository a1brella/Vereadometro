import { prisma } from "@/lib/prisma";
import { VereadometroClient } from "@/components/VereadometroClient";
import { MacroStats, VereadorWithDetails } from "@/lib/types";

export default async function Home() {
  const vereadoresFromDb = await prisma.vereador.findMany({
    orderBy: { rankingGeral: "asc" },
    include: {
      assessores: {
        where: { ativo: true },
        select: {
          id: true,
          nome: true,
          cargo: true,
          remuneracaoBruta: true,
          lotacao: true,
        },
      },
      gastos: {
        orderBy: [{ ano: "desc" }, { mes: "desc" }],
        take: 3,
        select: {
          id: true,
          ano: true,
          mes: true,
          salarioBruto: true,
          verbaGabinete: true,
          diarias: true,
          totalAssessoresValor: true,
          totalMes: true,
        },
      },
      projetos: {
        orderBy: { dataApresentacao: "desc" },
        select: {
          id: true,
          tipo: true,
          numero: true,
          ano: true,
          titulo: true,
          ementa: true,
          status: true,
        },
      },
    },
  });

  const vereadores: VereadorWithDetails[] = vereadoresFromDb.map((v) => ({
    id: v.id,
    slug: v.slug,
    nomeCompleto: v.nomeCompleto,
    nomeParlamentar: v.nomeParlamentar,
    partido: v.partido,
    fotoUrl: v.fotoUrl,
    biografia: v.biografia,
    status: v.status,
    telefoneGabinete: v.telefoneGabinete,
    emailGabinete: v.emailGabinete,
    salarioBase: v.salarioBase,
    totalAssessores: v.totalAssessores,
    totalGastoMes: v.totalGastoMes,
    totalGastoAno: v.totalGastoAno,
    totalProjetos: v.totalProjetos,
    taxaPresenca: v.taxaPresenca,
    custoPorProjeto: v.custoPorProjeto,
    votosUltimaEleicao: v.votosUltimaEleicao,
    rankingGeral: v.rankingGeral,
    assessores: v.assessores,
    gastos: v.gastos,
    projetos: v.projetos,
  }));

  const totalVereadores = vereadores.length;
  const totalGastoAno = vereadores.reduce((acc, curr) => acc + curr.totalGastoAno, 0);
  const totalGastoMes = vereadores.reduce((acc, curr) => acc + curr.totalGastoMes, 0);
  const totalAssessoresGeral = vereadores.reduce((acc, curr) => acc + curr.totalAssessores, 0);
  const totalProjetosAno = vereadores.reduce((acc, curr) => acc + curr.totalProjetos, 0);
  const mediaCustoMensal = totalVereadores > 0 ? totalGastoMes / totalVereadores : 0;
  const custoMedioPorProjeto = totalProjetosAno > 0 ? totalGastoAno / totalProjetosAno : 0;

  const topSpender = vereadores[0] || { nomeParlamentar: "N/D", totalGastoMes: 0 };

  const sessoesFromDb = await prisma.sessaoPlenaria.findMany({
    orderBy: { dataSessao: "desc" },
    take: 4,
  });

  const sessoes = sessoesFromDb.map((s) => ({
    id: s.id,
    videoId: s.videoId,
    numeroSessao: s.numeroSessao || "Sessão Plenária",
    tipoSessao: s.tipoSessao || "ORDINARIA",
    titulo: s.titulo,
    dataSessao: s.dataSessao.toISOString(),
    dataFormatada: s.dataFormatada || "Outubro de 2026",
    horario: s.horario || "09:00",
    youtubeUrl: s.youtubeUrl,
    resumo: s.resumo,
    totalFalas: s.totalFalas,
    vereadoresPresentes: s.vereadoresPresentes ? JSON.parse(s.vereadoresPresentes) : [],
    temasDiscutidos: s.temasDiscutidos ? JSON.parse(s.temasDiscutidos) : [],
  }));

  const stats: MacroStats = {
    totalVereadores,
    totalGastoAno,
    totalGastoMes,
    totalAssessoresGeral,
    mediaCustoMensal,
    vereadorMaisCaro: {
      nome: topSpender.nomeParlamentar,
      custoMes: topSpender.totalGastoMes,
    },
    totalProjetosAno,
    custoMedioPorProjeto,
  };

  return <VereadometroClient initialVereadores={vereadores} stats={stats} sessoes={sessoes} />;
}
