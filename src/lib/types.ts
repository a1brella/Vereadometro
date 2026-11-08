export interface VereadorWithDetails {
  id: string;
  slug: string;
  nomeCompleto: string;
  nomeParlamentar: string;
  partido: string;
  fotoUrl: string;
  biografia: string | null;
  status: string;
  telefoneGabinete: string | null;
  emailGabinete: string | null;
  salarioBase: number;
  totalAssessores: number;
  totalGastoMes: number;
  totalGastoAno: number;
  totalProjetos: number;
  taxaPresenca: number;
  custoPorProjeto: number;
  votosUltimaEleicao: number;
  rankingGeral: number;
  gastos?: Array<{
    id: string;
    ano: number;
    mes: number;
    salarioBruto: number;
    verbaGabinete: number;
    diarias: number;
    totalAssessoresValor: number;
    totalMes: number;
  }>;
  assessores?: Array<{
    id: string;
    nome: string;
    cargo: string;
    remuneracaoBruta: number;
    lotacao: string;
  }>;
  projetos?: Array<{
    id: string;
    tipo: string;
    numero: string;
    ano: number;
    titulo: string;
    ementa: string;
    status: string;
  }>;
}

export interface MacroStats {
  totalVereadores: number;
  totalGastoAno: number;
  totalGastoMes: number;
  totalAssessoresGeral: number;
  mediaCustoMensal: number;
  vereadorMaisCaro: {
    nome: string;
    custoMes: number;
  };
  totalProjetosAno: number;
  custoMedioPorProjeto: number;
}
