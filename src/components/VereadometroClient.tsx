"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { StatsSummary } from "@/components/StatsSummary";
import { VereadorRow } from "@/components/VereadorRow";
import { RecadoWhatsApp } from "@/components/RecadoWhatsApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShareCardModal } from "@/components/ShareCardModal";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { VereadorDetailModal } from "@/components/VereadorDetailModal";
import { IniciativaPopularSection } from "@/components/IniciativaPopularSection";
import { SessoesTranscritasSection } from "@/components/SessoesTranscritasSection";
import { VereadorWithDetails, MacroStats } from "@/lib/types";
import { Search, ArrowDown, ArrowUp } from "lucide-react";
import { FlagMark } from "@/components/Header";
import { tornClip } from "@/components/editorial/Editorial";

type SortKey = "ranking" | "custo-desc" | "custo-asc" | "assessores" | "projetos-asc" | "presenca";

/** Cabeçalho de coluna que ordena a lista ao ser clicado. */
function SortHeader({
  label,
  active,
  dir,
  center = false,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  center?: boolean;
  onClick: () => void;
}) {
  const Arrow = dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={`flex cursor-pointer items-center gap-1 uppercase underline-offset-4 hover:underline ${
        center ? "justify-center" : ""
      } ${active ? "text-yellow" : ""}`}
    >
      {label}
      <Arrow aria-hidden className={`size-3.5 ${active ? "opacity-100" : "opacity-0"}`} />
    </button>
  );
}

/**
 * Páginas empilhadas: cada .stack prende no topo e a seguinte sobe por cima.
 * Seções mais altas que a tela recebem um top negativo para rolarem inteiras
 * antes de prender — assim nada fica escondido embaixo da próxima folha.
 */
function useStackedPages(headerHeight = 64) {
  useEffect(() => {
    const sheets = Array.from(document.querySelectorAll<HTMLElement>("main > .stack"));
    const update = () => {
      const vh = window.innerHeight;
      sheets.forEach((el) => {
        el.style.top = `${Math.min(headerHeight, vh - el.offsetHeight)}px`;
      });
    };
    update();
    const ro = new ResizeObserver(update);
    sheets.forEach((el) => ro.observe(el));
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [headerHeight]);
}

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
  useStackedPages();
  const [search, setSearch] = useState("");
  const [selectedParty, setSelectedParty] = useState("TODOS");
  const [sortBy, setSortBy] = useState<SortKey>("ranking");

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

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* Header Sticky */}
      <Header onOpenLeadModal={() => handleOpenLead()} search={search} onSearch={setSearch} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Macro Indicadores */}
        <StatsSummary stats={stats} onOpenLeadModal={() => handleOpenLead()} />

        {/* Seção de Ranking & Filtros */}
        <section id="ranking-section" className="stack paper-news scroll-mt-16">
          <div className="page section-y relative isolate">
          <div className="mx-auto text-center">
            <h2 className="h-section text-ink lg:whitespace-nowrap" style={{ fontSize: "clamp(40px, 5.4vw, 92px)" }} data-reveal>
              Ranking de Gastos dos 21 Gabinetes
            </h2>
            <p className="mx-auto mt-6 max-w-xl font-type text-[17px] leading-snug text-ink-2">
              <strong className="text-ink">Câmara Municipal de Juazeiro do Norte.</strong> Ordene por custo, número de
              assessores contratados ou produção legislativa real.
            </p>
          </div>

          {/* Barra de ferramentas do ranking: fica presa sob o cabeçalho enquanto a lista rola */}
          <div className="sticky top-16 z-20 mt-12 bg-[var(--sheet-bg)] pt-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative lg:w-80">
                <Label htmlFor="busca" className="sr-only">
                  Buscar
                </Label>
                <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-paper" aria-hidden />
                <Input
                  id="busca"
                  type="search"
                  placeholder="Buscar por nome ou partido..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 border-ink bg-ink pl-11 text-paper placeholder:text-paper/60 focus-visible:bg-ink"
                />
              </div>

              {/* Partidos como categorias */}
              <div
                role="group"
                aria-label="Partido"
                className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto lg:flex-1"
              >
                {parties.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedParty(p)}
                    aria-pressed={selectedParty === p}
                    data-active={selectedParty === p}
                    className="chip shrink-0"
                  >
                    {p === "TODOS" ? "Todos os Partidos" : p}
                  </button>
                ))}
              </div>

              {/* Ordenação: seletor no celular; no desktop, o cabeçalho das colunas */}
              <div className="lg:hidden">
                <Label htmlFor="ordenar" className="sr-only">
                  Ordenar
                </Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  <SelectTrigger id="ordenar" className="w-full">
                    <span className="text-mute">Ordenar:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ranking">Posição no Ranking Geral</SelectItem>
                    <SelectItem value="custo-desc">Maior Custo no Mês</SelectItem>
                    <SelectItem value="custo-asc">Menor Custo no Mês</SelectItem>
                    <SelectItem value="assessores">Mais Assessores Nomeados</SelectItem>
                    <SelectItem value="projetos-asc">Menos Projetos (Pior Custo-Benefício)</SelectItem>
                    <SelectItem value="presenca">Maior Presença em Plenário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex min-h-10 items-center justify-between gap-3 py-2 text-[14px] text-mute" aria-live="polite">
              <span>
                {filteredVereadores.length} de {initialVereadores.length} vereadores
                <span className="hidden sm:inline"> · toque em um nome para auditar o gabinete</span>
              </span>
              {(search || selectedParty !== "TODOS") && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-8 text-[14px]"
                  onClick={() => {
                    setSearch("");
                    setSelectedParty("TODOS");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>

            {/* Cabeçalho ordenável (desktop) */}
            {filteredVereadores.length > 0 && (
              <div
                className="hidden grid-cols-[4rem_4.5rem_minmax(0,1.6fr)_minmax(10.5rem,1fr)_repeat(3,5rem)_1.5rem] items-center gap-x-4 bg-ink px-4 py-3.5 font-type text-[13px] font-bold uppercase tracking-[0.06em] text-paper lg:grid"
                style={{ clipPath: tornClip(45, "tb", 5, 60) }}
              >
                <SortHeader label="#" active={sortBy === "ranking"} dir="asc" onClick={() => setSortBy("ranking")} />
                <span />
                <span>Vereador</span>
                <SortHeader
                  label="Custo Total no Mês"
                  active={sortBy === "custo-desc" || sortBy === "custo-asc"}
                  dir={sortBy === "custo-asc" ? "asc" : "desc"}
                  onClick={() => setSortBy(sortBy === "custo-desc" ? "custo-asc" : "custo-desc")}
                />
                <SortHeader label="Assessores" center active={sortBy === "assessores"} dir="desc" onClick={() => setSortBy("assessores")} />
                <SortHeader label="Projetos" center active={sortBy === "projetos-asc"} dir="asc" onClick={() => setSortBy("projetos-asc")} />
                <SortHeader label="Presença" center active={sortBy === "presenca"} dir="desc" onClick={() => setSortBy("presenca")} />
                <span />
              </div>
            )}
          </div>

          {filteredVereadores.length === 0 ? (
            <div className="py-14 text-center">
              <h3 className="font-display text-[24px] text-ink">Nenhum vereador encontrado com esses filtros</h3>
              <p className="mt-3 text-[17px] text-ink-2">Tente limpar a pesquisa ou selecionar outro partido.</p>
            </div>
          ) : (
            <ol>
              {filteredVereadores.map((v) => (
                <VereadorRow key={v.id} vereador={v} onDetails={(vereador) => setDetailVereador(vereador)} />
              ))}
            </ol>
          )}
          </div>
        </section>

        {/* Recado: depois de ver os números, o convite para acompanhar */}
        <RecadoWhatsApp onOpenLeadModal={() => handleOpenLead()} />

        {/* Módulo C: Hub do Projeto de Iniciativa Popular (Trava-Salário) */}
        <IniciativaPopularSection />

        {/* Monitor de Sessões e Falas da TV Câmara */}
        <SessoesTranscritasSection sessoes={sessoes} />

        {/* Seção Explicativa: Como Funciona a Auditoria Cívica */}
        <section id="fontes" className="stack paper-news scroll-mt-16 overflow-hidden">
          <div className="page section-y">
            <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Título e as duas fotos do acervo */}
              <div className="lg:col-span-5">
                <h2 className="h-section text-ink" data-reveal>
                  De onde vêm esses dados?
                </h2>

                <div aria-hidden className="mt-10 grid grid-cols-2 gap-5">
                  <figure className="relative -rotate-2">
                    <img
                      src="/collage/basilica-ht.webp"
                      alt=""
                      className="aspect-[4/5] w-full border-[6px] border-sheet object-cover shadow-[0_6px_14px_rgba(21,19,17,0.28)]"
                    />
                    <div className="tape -top-3 left-1/3 !w-16 rotate-[-5deg]" />
                  </figure>
                  <figure className="relative mt-8 rotate-[3deg]">
                    <img
                      src="/collage/casa-museu-ht.webp"
                      alt=""
                      className="aspect-[4/5] w-full border-[6px] border-sheet object-cover shadow-[0_6px_14px_rgba(21,19,17,0.28)]"
                    />
                    <div className="tape -top-3 left-1/3 !w-16 rotate-[6deg]" />
                  </figure>
                </div>
              </div>

              {/* Texto e fontes */}
              <div className="lg:col-span-7 lg:border-l lg:border-ink/30 lg:pl-14" data-reveal>
                <p className="font-type text-[19px] leading-[1.65] text-ink sm:text-[20px]">
                  O <strong>Vereadômetro Juazeiro</strong> é uma plataforma cívica{" "}
                  <span className="marker font-bold">100% independente e apartidária</span>. Nossos dados são extraídos do
                  Portal da Transparência da Câmara Municipal de Juazeiro do Norte, do Tribunal de Contas do Estado do Ceará
                  (TCE/TCM-CE) e do Sistema de Apoio ao Processo Legislativo (SAPL), com amparo na Lei Federal de Acesso à
                  Informação (Lei nº 12.527/2011).
                </p>

                {/* Fontes como notas de rodapé */}
                <ol className="mt-10 border-t-2 border-ink">
                  {[
                    "Câmara de Juazeiro do Norte",
                    "Tribunal de Contas do Ceará (TCE-CE)",
                    "Lei de Acesso à Informação (LAI)",
                  ].map((fonte, i) => (
                    <li key={fonte} className="flex items-baseline gap-5 border-b border-ink/25 py-5">
                      <span className="tabular w-10 shrink-0 font-display text-[40px] leading-none text-red">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[20px] font-bold leading-snug text-ink">{fonte}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Cívico: simples, em tinta preta */}
      <footer className="bg-ink text-paper">
        <div className="page py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <FlagMark className="size-10 shrink-0" />
              <div className="leading-none">
                <span className="block font-display text-[26px]">Vereadômetro Juazeiro</span>
                <span className="mt-1.5 block font-type text-[14px] text-yellow">Fiscalização Popular no Cariri</span>
              </div>
            </div>
            <p className="font-type text-[14px] leading-relaxed text-paper/75 md:text-right">
              © 2026 Movimento Juazeiro Transparente.
              <br />
              Feito pelo povo e para o povo.
            </p>
          </div>

          <details className="mt-8 border-t border-paper/15 pt-5 font-type text-[13px] leading-relaxed text-paper/60">
            <summary className="w-fit cursor-pointer text-[13px] font-bold text-paper/75 transition-colors hover:text-yellow">
              Créditos das imagens da colagem
            </summary>
            <p className="mt-3 max-w-4xl">
              Imagens do Wikimedia Commons, tratadas (recorte, retícula, duotom). Padre Cícero, c. 1914 — domínio público.
              Estátua do Padre Cícero no Horto e vista de Juazeiro do Norte — Allan Patrick, CC BY-SA 2.0. Romeiros e
              Reisado — Danielle Pereira, CC BY 2.0. Romeiro com vela — Zizomegouveia, CC BY-SA 4.0. Casa Museu Padre
              Cícero — Fabiobarros, CC BY-SA 4.0. Basílica de N. Sra. das Dores — Paróquia Basílica Santuário, CC0. Flor
              do mandacaru — J. D. Hooker, Curtis&apos;s Botanical Magazine 1869, domínio público. Algodão — Coleção
              Brasiliana Iconográfica, domínio público. Xilogravura — Lucélia Borges, CC BY-SA 4.0. Obras derivadas sob
              as mesmas licenças.
            </p>
          </details>
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
        onShare={(v) => {
          setDetailVereador(null);
          setShareVereador(v);
        }}
      />
    </div>
  );
};
