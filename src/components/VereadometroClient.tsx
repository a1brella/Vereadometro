"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { StatsSummary } from "@/components/StatsSummary";
import { VereadorCard } from "@/components/VereadorCard";
import { ShareCardModal } from "@/components/ShareCardModal";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { VereadorDetailModal } from "@/components/VereadorDetailModal";
import { IniciativaPopularSection } from "@/components/IniciativaPopularSection";
import { SessoesTranscritasSection } from "@/components/SessoesTranscritasSection";
import { VereadorWithDetails, MacroStats } from "@/lib/types";
import { Search, SlidersHorizontal, Shield, Landmark } from "lucide-react";

interface VereadometroClientProps {
  initialVereadores: VereadorWithDetails[];
  stats: MacroStats;
  sessoes?: any[];
}

export const VereadometroClient: React.FC<VereadometroClientProps> = ({
  initialVereadores,
  stats,
  sessoes = [],
}) => {
  const [search, setSearch] = useState("");
  const [selectedParty, setSelectedParty] = useState("TODOS");
  const [sortBy, setSortBy] = useState<"ranking" | "custo-desc" | "custo-asc" | "assessores" | "projetos-asc" | "presenca">("ranking");

  // Modals state
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedVereadorForLead, setSelectedVereadorForLead] = useState<string | undefined>();
  const [shareVereador, setShareVereador] = useState<VereadorWithDetails | null>(null);
  const [detailVereador, setDetailVereador] = useState<VereadorWithDetails | null>(null);

  // Lista de partidos únicos
  const parties = useMemo(() => {
    const list = Array.from(new Set(initialVereadores.map((v) => v.partido)));
    return ["TODOS", ...list.sort()];
  }, [initialVereadores]);

  // Filtragem e ordenação
  const filteredVereadores = useMemo(() => {
    return initialVereadores
      .filter((v) => {
        const matchesSearch =
          v.nomeParlamentar.toLowerCase().includes(search.toLowerCase()) ||
          v.nomeCompleto.toLowerCase().includes(search.toLowerCase()) ||
          v.partido.toLowerCase().includes(search.toLowerCase());

        const matchesParty = selectedParty === "TODOS" || v.partido === selectedParty;
        return matchesSearch && matchesParty;
      })
      .sort((a, b) => {
        if (sortBy === "ranking") return a.rankingGeral - b.rankingGeral;
        if (sortBy === "custo-desc") return b.totalGastoMes - a.totalGastoMes;
        if (sortBy === "custo-asc") return a.totalGastoMes - b.totalGastoMes;
        if (sortBy === "assessores") return b.totalAssessores - a.totalAssessores;
        if (sortBy === "projetos-asc") return a.totalProjetos - b.totalProjetos;
        if (sortBy === "presenca") return b.taxaPresenca - a.taxaPresenca;
        return 0;
      });
  }, [initialVereadores, search, selectedParty, sortBy]);

  const handleOpenLead = (vereadorId?: string) => {
    setSelectedVereadorForLead(vereadorId);
    setLeadModalOpen(true);
  };

  const scrollToRanking = () => {
    const el = document.getElementById("ranking-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToIniciativa = () => {
    const el = document.getElementById("iniciativa-popular");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Sticky */}
      <Header
        onOpenLeadModal={() => handleOpenLead()}
        onScrollToRanking={scrollToRanking}
        onScrollToIniciativa={scrollToIniciativa}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Macro Indicadores */}
        <StatsSummary stats={stats} onOpenLeadModal={() => handleOpenLead()} />

        {/* Seção de Ranking & Filtros */}
        <section id="ranking-section" className="py-8 px-4 sm:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Landmark className="w-4 h-4" />
                <span>Câmara Municipal de Juazeiro do Norte</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Ranking de Gastos dos 21 Gabinetes
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ordene por custo, número de assessores contratados ou produção legislativa real.
              </p>
            </div>

            {/* Controles de Filtros e Busca */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Campo de Busca */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou partido..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Filtro Partido */}
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                {parties.map((p) => (
                  <option key={p} value={p}>
                    {p === "TODOS" ? "Todos os Partidos" : p}
                  </option>
                ))}
              </select>

              {/* Ordenação */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ranking" className="bg-slate-900">
                    Posição no Ranking Geral
                  </option>
                  <option value="custo-desc" className="bg-slate-900">
                    Maior Custo no Mês
                  </option>
                  <option value="custo-asc" className="bg-slate-900">
                    Menor Custo no Mês
                  </option>
                  <option value="assessores" className="bg-slate-900">
                    Mais Assessores Nomeados
                  </option>
                  <option value="projetos-asc" className="bg-slate-900">
                    Menos Projetos (Pior Custo-Benefício)
                  </option>
                  <option value="presenca" className="bg-slate-900">
                    Maior Presença em Plenário
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid dos Cards dos 21 Vereadores */}
          {filteredVereadores.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40">
              <Shield className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-300">
                Nenhum vereador encontrado com esses filtros
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tente limpar a pesquisa ou selecionar outro partido.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVereadores.map((v) => (
                <VereadorCard
                  key={v.id}
                  vereador={v}
                  onFollow={(vereador) => handleOpenLead(vereador.id)}
                  onShare={(vereador) => setShareVereador(vereador)}
                  onDetails={(vereador) => setDetailVereador(vereador)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Módulo C: Hub do Projeto de Iniciativa Popular (Trava-Salário) */}
        <IniciativaPopularSection />

        {/* Monitor de Sessões e Falas da TV Câmara */}
        <SessoesTranscritasSection sessoes={sessoes} />

        {/* Seção Explicativa: Como Funciona a Auditoria Cívica */}
        <section className="py-12 px-4 sm:px-6 bg-slate-950/60 border-t border-slate-800/80">
          <div className="mx-auto max-w-5xl text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              De onde vêm esses dados?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed">
              O <strong>Vereadômetro Juazeiro</strong> é uma plataforma cívica 100% independente e apartidária. Nossos dados são extraídos do Portal da Transparência da Câmara Municipal de Juazeiro do Norte, do Tribunal de Contas do Estado do Ceará (TCE/TCM-CE) e do Sistema de Apoio ao Processo Legislativo (SAPL), com amparo na Lei Federal de Acesso à Informação (Lei nº 12.527/2011).
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                🏛️ Câmara de Juazeiro do Norte
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                ⚖️ Tribunal de Contas do Ceará (TCE-CE)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                🔍 Lei de Acesso à Informação (LAI)
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Cívico */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">VEREADÔMETRO JUAZEIRO</span>
            <span className="text-emerald-400">• Fiscalização Popular no Cariri</span>
          </div>
          <p>© 2026 Movimento Juazeiro Transparente. Feito pelo povo e para o povo.</p>
        </div>
      </footer>

      {/* Modals */}
      <LeadCaptureModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        vereadores={initialVereadores}
        initialSelectedVereadorId={selectedVereadorForLead}
      />

      <ShareCardModal
        vereador={shareVereador}
        onClose={() => setShareVereador(null)}
      />

      <VereadorDetailModal
        vereador={detailVereador}
        onClose={() => setDetailVereador(null)}
        onFollow={(v) => handleOpenLead(v.id)}
      />
    </div>
  );
};
