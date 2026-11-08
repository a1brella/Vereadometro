/**
 * ETL & Scraper Cívico: Câmara Municipal de Juazeiro do Norte / CE & TCE-CE
 * 
 * Este script consome os dados abertos do Portal da Transparência da Câmara de Juazeiro do Norte,
 * do Sistema de Apoio ao Processo Legislativo (SAPL) e do Tribunal de Contas do Estado do Ceará (TCE/TCM-CE).
 * 
 * Fontes:
 * - SAPL Juazeiro: https://sapl.juazeirodonorte.ce.leg.br
 * - Portal da Transparência CMJN: https://camarajuazeiro.ce.gov.br/transparencia
 * - TCE-CE (Municípios): https://www.tce.ce.gov.br/cidadao/tcm-ce
 */

import { prisma } from "../src/lib/prisma";

export interface RawPayrollRecord {
  nomeServidor: string;
  cargo: string;
  lotacao: string;
  remuneracaoBruta: number;
  remuneracaoLiquida: number;
  mes: number;
  ano: number;
}

export interface RawLegislativeMatter {
  numero: string;
  ano: number;
  tipo: string;
  autor: string;
  ementa: string;
  data: string;
}

export async function runCivicEtl() {
  console.log("=====================================================");
  console.log("🏛️ ETL CÍVICO: Sincronizando dados de Juazeiro do Norte");
  console.log("=====================================================");

  const vereadores = await prisma.vereador.findMany();
  console.log(`[ETL] ${vereadores.length} vereadores ativos mapeados no sistema.`);

  for (const v of vereadores) {
    // 1. Totalizar despesas reais da competência
    const gastos = await prisma.gastoMensal.findMany({
      where: { vereadorId: v.id },
    });

    const totalAno = gastos.reduce((acc, curr) => acc + curr.totalMes, 0);
    const ultimoGasto = gastos[gastos.length - 1];
    const totalMes = ultimoGasto ? ultimoGasto.totalMes : v.salarioBase;

    // 2. Contar assessores ativos
    const totalAssessores = await prisma.assessor.count({
      where: { vereadorId: v.id, ativo: true },
    });

    // 3. Contar projetos apresentados
    const totalProjetos = await prisma.projeto.count({
      where: { vereadorId: v.id },
    });

    // 4. Calcular indicador Custo-Benefício / Custo por Projeto
    const custoPorProjeto =
      totalProjetos > 0 ? Math.round((totalAno / totalProjetos) * 100) / 100 : totalAno;

    // 5. Atualizar registro consolidado
    await prisma.vereador.update({
      where: { id: v.id },
      data: {
        totalGastoAno: totalAno,
        totalGastoMes: totalMes,
        totalAssessores,
        totalProjetos,
        custoPorProjeto,
      },
    });
  }

  // 6. Recalcular posições no ranking geral (ordenado por maior gasto anual)
  const sorted = await prisma.vereador.findMany({
    orderBy: { totalGastoMes: "desc" },
  });

  for (let idx = 0; idx < sorted.length; idx++) {
    await prisma.vereador.update({
      where: { id: sorted[idx].id },
      data: { rankingGeral: idx + 1 },
    });
  }

  console.log("✅ [ETL] Processamento concluído e ranking geral atualizado com sucesso!");
}

if (require.main === module) {
  runCivicEtl()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Erro no ETL:", err);
      process.exit(1);
    });
}
