"use client";

import React, { useState, useMemo } from "react";
import { Search, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/editorial/Editorial";

export interface FalaSnippet {
  text: string;
  start: number;
  timeStr: string;
  duration: number;
  tema: string;
  orador?: string | null;
  youtubeLink: string;
}

export interface DiscursoAgrupado {
  id: string;
  orador: string;
  tema: string;
  start: number;
  end: number;
  timeStartStr: string;
  timeEndStr: string;
  durationSec: number;
  text: string;
  youtubeLink: string;
  snippetCount: number;
}

export interface SessaoDetail {
  id: string;
  videoId: string;
  numeroSessao?: string;
  tipoSessao?: string;
  titulo: string;
  dataSessao: string | Date;
  dataFormatada?: string;
  horario?: string;
  youtubeUrl: string;
  resumo: string | null;
  totalFalas: number;
  vereadoresPresentes: string[];
  temasDiscutidos: string[];
  transcricao?: FalaSnippet[];
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function capitalizeSentences(text: string): string {
  if (!text) return "";
  return text
    .replace(/(^\s*|[.!?]\s+)([a-zà-öø-ÿ])/g, (m, p1, p2) => p1 + p2.toUpperCase())
    .trim();
}

/**
 * Agrupa micro-trechos fragmentados do YouTube em discursos e parágrafos contínuos.
 * Torna a leitura 100% legível para seres humanos.
 */
function agruparEmDiscursos(snippets: FalaSnippet[]): DiscursoAgrupado[] {
  if (!snippets || snippets.length === 0) return [];

  const discursos: DiscursoAgrupado[] = [];
  let current: {
    orador: string;
    tema: string;
    start: number;
    end: number;
    texts: string[];
    youtubeLink: string;
    count: number;
  } | null = null;

  for (let i = 0; i < snippets.length; i++) {
    const s = snippets[i];
    let cleaned = (s.text || "").trim();
    if (cleaned.startsWith(">>")) {
      cleaned = cleaned.replace(/^>>\s*/, "");
    }
    if (!cleaned) continue;

    const spk = s.orador || "Mesa Diretora";
    const start = s.start;
    const dur = s.duration || 3.0;
    const end = start + dur;
    const tema = s.tema || "Debates Gerais";

    if (!current) {
      current = {
        orador: spk,
        tema,
        start,
        end,
        texts: [cleaned],
        youtubeLink: s.youtubeLink,
        count: 1,
      };
    } else {
      const sameSpeaker = spk === current.orador;
      const timeGap = start - current.end;
      const wordCount = current.texts.reduce((acc, t) => acc + t.split(/\s+/).length, 0);

      // Agrupa se for o mesmo orador e pausa for menor que 5s,
      // até atingir ~60 palavras por parágrafo para manter a leitura fluída e agradável
      if (sameSpeaker && timeGap <= 5.5 && wordCount < 60) {
        current.texts.push(cleaned);
        current.end = Math.max(current.end, end);
        current.count += 1;
        if (tema !== "Debates Gerais" && current.tema === "Debates Gerais") {
          current.tema = tema;
        }
      } else {
        const fullText = capitalizeSentences(current.texts.join(" "));
        discursos.push({
          id: `discurso-${discursos.length}`,
          orador: current.orador,
          tema: current.tema,
          start: current.start,
          end: current.end,
          timeStartStr: formatTime(current.start),
          timeEndStr: formatTime(current.end),
          durationSec: Math.max(1, Math.round(current.end - current.start)),
          text: fullText,
          youtubeLink: current.youtubeLink,
          snippetCount: current.count,
        });

        current = {
          orador: spk,
          tema,
          start,
          end,
          texts: [cleaned],
          youtubeLink: s.youtubeLink,
          count: 1,
        };
      }
    }
  }

  if (current && current.texts.length > 0) {
    const fullText = capitalizeSentences(current.texts.join(" "));
    discursos.push({
      id: `discurso-${discursos.length}`,
      orador: current.orador,
      tema: current.tema,
      start: current.start,
      end: current.end,
      timeStartStr: formatTime(current.start),
      timeEndStr: formatTime(current.end),
      durationSec: Math.max(1, Math.round(current.end - current.start)),
      text: fullText,
      youtubeLink: current.youtubeLink,
      snippetCount: current.count,
    });
  }

  return discursos;
}

interface SessaoDetailModalProps {
  sessao: SessaoDetail | null;
  initialTag?: string | null;
  onClose: () => void;
}

export const SessaoDetailModal: React.FC<SessaoDetailModalProps> = ({
  sessao,
  initialTag,
  onClose,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>(initialTag || "TODAS");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"discursos" | "linhas">("discursos");

  // Carregar transcrição completa caso não esteja no objeto inicial
  const [fullTranscripts, setFullTranscripts] = useState<FalaSnippet[]>(
    sessao?.transcricao || []
  );
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (sessao) {
      setSelectedTag(initialTag || "TODAS");
      setSelectedSpeaker("TODOS");
      setSearchTerm("");
      if (!sessao.transcricao || sessao.transcricao.length === 0) {
        setLoading(true);
        fetch(`/api/sessoes/${sessao.videoId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.sessao && data.sessao.transcricao) {
              setFullTranscripts(data.sessao.transcricao);
            }
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setFullTranscripts(sessao.transcricao);
      }
    }
  }, [sessao, initialTag]);

  // Agrupamento contínuo inteligente de falas em discursos/parágrafos fluídos
  const discursos = useMemo(() => {
    return agruparEmDiscursos(fullTranscripts);
  }, [fullTranscripts]);

  // Lista de tags de temas disponíveis nesta sessão
  const availableTags = useMemo(() => {
    if (!sessao) return [];
    const setTags = new Set<string>();
    discursos.forEach((d) => {
      if (d.tema && d.tema !== "Debates Gerais") setTags.add(d.tema);
    });
    return Array.from(setTags).sort();
  }, [sessao, discursos]);

  // Contagem por tag de temas
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { TODAS: discursos.length };
    discursos.forEach((d) => {
      counts[d.tema] = (counts[d.tema] || 0) + 1;
    });
    return counts;
  }, [discursos]);

  // Oradores detectados nesta sessão (ordenados por volume de intervenções)
  const { availableSpeakers, speakerCounts } = useMemo(() => {
    const counts: Record<string, number> = { TODOS: discursos.length };
    discursos.forEach((d) => {
      const spk = d.orador || "Mesa Diretora";
      counts[spk] = (counts[spk] || 0) + 1;
    });

    const speakers = Object.keys(counts)
      .filter((k) => k !== "TODOS")
      .sort((a, b) => counts[b] - counts[a]);

    return { availableSpeakers: speakers, speakerCounts: counts };
  }, [discursos]);

  // Filtragem dos Discursos Agrupados (Humano / Fluído)
  const filteredDiscursos = useMemo(() => {
    return discursos.filter((d) => {
      const matchTag = selectedTag === "TODAS" || d.tema === selectedTag;
      const speechSpeaker = d.orador || "Mesa Diretora";
      const matchSpeaker = selectedSpeaker === "TODOS" || speechSpeaker === selectedSpeaker;
      const matchSearch =
        !searchTerm.trim() ||
        d.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speechSpeaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tema.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTag && matchSpeaker && matchSearch;
    });
  }, [discursos, selectedTag, selectedSpeaker, searchTerm]);

  // Filtragem das Falas Linha a Linha (técnica / granular)
  const filteredLinhas = useMemo(() => {
    return fullTranscripts.filter((f) => {
      const matchTag = selectedTag === "TODAS" || f.tema === selectedTag;
      const speechSpeaker = f.orador || "Mesa Diretora";
      const matchSpeaker = selectedSpeaker === "TODOS" || speechSpeaker === selectedSpeaker;
      const matchSearch =
        !searchTerm.trim() ||
        f.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speechSpeaker.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTag && matchSpeaker && matchSearch;
    });
  }, [fullTranscripts, selectedTag, selectedSpeaker, searchTerm]);

  if (!sessao) return null;

  const handleCopyTranscript = () => {
    if (viewMode === "discursos") {
      const textToCopy = filteredDiscursos
        .map((d) => `[${d.timeStartStr} - ${d.timeEndStr}] (${d.orador}) [${d.tema}]\n"${d.text}"`)
        .join("\n\n");
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textToCopy = filteredLinhas
        .map((f) => `[${f.timeStr}] ${f.orador ? `(${f.orador}) ` : ""}${f.text}`)
        .join("\n\n");
      navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakerTone = (spk: string, isCouncilor: boolean) =>
    isCouncilor
      ? "bg-blue text-paper border-blue"
      : spk === "Mesa Diretora"
      ? "bg-ink text-paper border-ink"
      : "bg-pink text-ink border-ink";

  return (
    <ModalShell onClose={onClose} label={`Transcrição: ${sessao.titulo}`} className="max-w-5xl">
      <div className="flex max-h-[92vh] flex-col">
        {/* Topo do Modal */}
        <div className="border-b-2 border-ink px-5 pb-4 pt-5 pr-12 sm:px-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-sm bg-red px-2.5 py-1 text-[13px] font-bold text-white">
              {sessao.numeroSessao || "Sessão Plenária"}
            </span>
            {sessao.dataFormatada && (
              <span className="rounded-sm border-2 border-ink px-2 py-0.5 text-[13px] font-medium">
                {sessao.dataFormatada}
              </span>
            )}
            {sessao.horario && (
              <span className="rounded-sm border-2 border-ink px-2 py-0.5 text-[13px] font-medium">⏰ {sessao.horario}</span>
            )}
          </div>

          <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">{sessao.titulo}</h2>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-ink-2">
            <span className="flex items-center gap-1">
              {sessao.totalFalas.toLocaleString("pt-BR")} falas transcritas • {discursos.length} discursos organizados
            </span>
            <span>•</span>
            <a
              href={sessao.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-red underline decoration-2 underline-offset-4 hover:text-red-deep"
            >
              <span>Assistir transmissão oficial no YouTube</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 sm:px-7">
          {/* Resumo com IA & Clima Político */}
          {sessao.resumo && (
            <div className="mt-4 shrink-0 rounded-sm bg-paper-2 p-3.5 text-[15px] leading-relaxed text-ink-2">
              <div className="mb-1 flex items-center gap-1.5 text-[14px] font-bold text-ink">
                <span>Resumo Executivo da Sessão</span>
              </div>
              {sessao.resumo}
            </div>
          )}

          {/* Barra de Filtros: Busca, Seletor de Modo, Oradores e Tags */}
          <div className="shrink-0 space-y-3 border-b-[1.5px] border-ink py-3">
            {/* Linha 1: Busca + Alternador de Visualização + Copiar */}
            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-end">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink" aria-hidden />
                <Input
                  type="search"
                  aria-label="Pesquisar nas falas"
                  placeholder="Pesquisar por assunto, vereador, palavra-chave (ex: UPA, asfalto, Saulo, Limoeiro)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </label>

              <div className="flex shrink-0 items-center gap-2">
                {/* Alternador de Modo: Parágrafos Fluídos vs Linha por Linha */}
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "discursos" | "linhas")}>
                  <TabsList>
                    <TabsTrigger
                      value="discursos"
                      title="Falas agrupadas em parágrafos contínuos e fluídos (leitura natural para humanos)"
                    >
                      Modo Parágrafos
                    </TabsTrigger>
                    <TabsTrigger value="linhas" title="Legendas fragmentadas linha por linha originais do YouTube">
                      Linha por Linha
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Botão Copiar */}
                <Button
                  onClick={handleCopyTranscript}
                  disabled={(viewMode === "discursos" ? filteredDiscursos.length : filteredLinhas.length) === 0} variant="outline">
                  {copied ? (
                    <>
                      <span className="text-leaf">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <span>Copiar Trechos</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Filtro 1: Oradores na Tribuna */}
            {availableSpeakers.length > 0 && (
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="mr-1 flex shrink-0 items-center gap-1 text-[14px] font-semibold text-ink-2">
                  Orador:
                </span>
                <button
                  onClick={() => setSelectedSpeaker("TODOS")}
                  data-active={selectedSpeaker === "TODOS"}
                  className="chip shrink-0"
                >
                  <span>Todos</span>
                  <span className="opacity-60">{speakerCounts["TODOS"] || 0}</span>
                </button>

                {availableSpeakers.map((spk) => (
                  <button
                    key={spk}
                    onClick={() => setSelectedSpeaker(spk)}
                    data-active={selectedSpeaker === spk}
                    className="chip shrink-0"
                  >
                    <span>{spk}</span>
                    <span className="opacity-60">{speakerCounts[spk] || 0}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Filtro 2: Tags de Pautas / Temas */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="mr-1 flex shrink-0 items-center gap-1 text-[14px] font-semibold text-ink-2">
                Pauta:
              </span>
              <button
                onClick={() => setSelectedTag("TODAS")}
                data-active={selectedTag === "TODAS"}
                className="chip shrink-0"
              >
                <span>Todas</span>
                <span className="opacity-60">{tagCounts["TODAS"] || 0}</span>
              </button>

              {availableTags.map((t) => (
                <button key={t} onClick={() => setSelectedTag(t)} data-active={selectedTag === t} className="chip shrink-0">
                  <span>{t}</span>
                  <span className="opacity-60">{tagCounts[t] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Discursos / Falas */}
          <div className="thin-scroll mt-3 flex-1 space-y-3 overflow-y-auto pb-3 pr-1">
            {loading ? (
              <div className="py-16 text-center text-[16px] text-ink-2">
                Carregando transcrição detalhada da sessão...
              </div>
            ) : viewMode === "discursos" ? (
              /* MODO DISCURSOS (PARÁGRAFOS HUMANOS FLUÍDOS) */
              filteredDiscursos.length === 0 ? (
                <div className="border-2 border-dashed border-ink py-12 text-center">
                  <p className="font-display text-[22px] text-ink">Nenhum discurso encontrado com os filtros selecionados.</p>
                  <p className="mt-1 text-[15px] text-ink-2">
                    Tente redefinir o orador, selecionar outra pauta ou limpar o campo de busca.
                  </p>
                </div>
              ) : (
                filteredDiscursos.map((d) => {
                  const spk = d.orador || "Mesa Diretora";
                  const isCouncilor =
                    spk.includes("Professora") ||
                    spk.includes("Jullian") ||
                    spk.includes("Capitão") ||
                    spk.includes("Felipe") ||
                    spk.includes("Badú") ||
                    spk.includes("Lukão");

                  return (
                    <div
                      key={d.id}
                      className="group border-b border-ink/20 pb-4 pt-2 transition-colors hover:bg-yellow/15"
                    >
                      {/* Cabeçalho do Bloco: Orador, Pauta e Link com Tempo */}
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Selo do Orador */}
                          <button
                            onClick={() => setSelectedSpeaker(spk)}
                            title={`Filtrar falas de ${spk}`}
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-sm border-2 px-2.5 py-1 text-[13px] font-bold transition-transform hover:-translate-y-0.5 ${speakerTone(spk, isCouncilor)}`}
                          >
                            <span>{spk}</span>
                          </button>

                          {/* Selo da Pauta Temática */}
                          {d.tema && d.tema !== "Debates Gerais" && (
                            <button
                              onClick={() => setSelectedTag(d.tema)}
                              title={`Filtrar apenas por ${d.tema}`}
                              className="cursor-pointer rounded-sm bg-yellow px-2 py-1 text-[13px] font-bold text-ink transition-transform hover:-translate-y-0.5"
                            >
                              {d.tema}
                            </button>
                          )}
                        </div>

                        {/* Timestamp com Play no YouTube */}
                        <a
                          href={d.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ouvir este trecho na íntegra no YouTube"
                          className="group/btn tabular inline-flex items-center gap-1.5 rounded-sm border-2 border-red px-2.5 py-1 text-[13px] font-bold text-red transition-colors hover:bg-red hover:text-white"
                        >
                          <span>
                            {d.timeStartStr} → {d.timeEndStr}
                          </span>
                          <span className="text-[10px] opacity-80">({d.durationSec}s)</span>
                          <ExternalLink className="h-3 w-3 opacity-70 transition group-hover/btn:translate-x-0.5" />
                        </a>
                      </div>

                      {/* Texto Fluído e Contínuo do Discurso */}
                      <p className="max-w-[70ch] select-text text-[17px] leading-[1.6] text-ink">&ldquo;{d.text}&rdquo;</p>
                    </div>
                  );
                })
              )
            ) : /* MODO LINHA POR LINHA (LEGENDAS ISOLADAS) */
            filteredLinhas.length === 0 ? (
              <div className="border-2 border-dashed border-ink py-12 text-center">
                <p className="font-display text-[22px] text-ink">Nenhuma fala encontrada com os filtros selecionados.</p>
              </div>
            ) : (
              filteredLinhas.map((fala, idx) => {
                const spk = fala.orador || "Mesa Diretora";
                const isCouncilor =
                  spk.includes("Professora") ||
                  spk.includes("Jullian") ||
                  spk.includes("Capitão") ||
                  spk.includes("Felipe") ||
                  spk.includes("Badú") ||
                  spk.includes("Lukão");

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-start gap-3 border-b border-ink/15 py-2.5 transition-colors hover:bg-yellow/15 sm:flex-row"
                  >
                    <div className="flex shrink-0 items-center gap-2 sm:w-28 sm:flex-col sm:items-start sm:gap-1.5">
                      <a
                        href={fala.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvir este trecho no YouTube"
                        className="tabular inline-flex items-center gap-1 text-[13px] font-bold text-red hover:underline"
                      >
                        <span>{fala.timeStr}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </a>

                      {fala.tema && fala.tema !== "Debates Gerais" && (
                        <button
                          onClick={() => setSelectedTag(fala.tema)}
                          className="cursor-pointer rounded-sm bg-yellow px-1.5 py-0.5 text-left text-[12px] font-bold text-ink"
                        >
                          {fala.tema}
                        </button>
                      )}
                    </div>

                    <div className="flex-1">
                      <button
                        onClick={() => setSelectedSpeaker(spk)}
                        className={`mb-1 inline-flex cursor-pointer items-center gap-1 rounded-sm border px-2 py-0.5 text-[12px] font-bold ${speakerTone(spk, isCouncilor)}`}
                      >
                        <span>{spk}</span>
                      </button>
                      <p className="select-text text-[15px] leading-relaxed text-ink-2">&ldquo;{fala.text}&rdquo;</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t-2 border-ink px-5 py-3 text-[13px] text-ink-2 sm:px-7">
          <span>
            {viewMode === "discursos" ? (
              <>
                Exibindo <strong className="text-ink">{filteredDiscursos.length}</strong> intervenções fluídas estruturadas (a
                partir de <strong className="text-ink">{fullTranscripts.length}</strong> legendas do YouTube)
              </>
            ) : (
              <>
                Exibindo <strong className="text-ink">{filteredLinhas.length}</strong> de{" "}
                <strong className="text-ink">{fullTranscripts.length}</strong> frases curtas
              </>
            )}
          </span>
          <Button onClick={onClose} variant="ink">
            Fechar
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};
