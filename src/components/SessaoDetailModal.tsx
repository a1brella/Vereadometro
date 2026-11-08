import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Tag,
  Clock,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Radio,
  Sparkles,
  Filter,
  User,
  BookOpen,
  ListFilter,
  Volume2,
} from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo do Modal */}
        <div className="border-b border-slate-800 pb-4 pr-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-lg bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-xs font-black text-red-400 uppercase tracking-wide flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
              {sessao.numeroSessao || "Sessão Plenária"}
            </span>
            {sessao.dataFormatada && (
              <span className="rounded-lg bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                📅 {sessao.dataFormatada}
              </span>
            )}
            {sessao.horario && (
              <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                ⏰ {sessao.horario}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {sessao.titulo}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              {sessao.totalFalas.toLocaleString("pt-BR")} falas transcritas • {discursos.length} discursos organizados
            </span>
            <span>•</span>
            <a
              href={sessao.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold"
            >
              <span>Assistir transmissão oficial no YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Resumo com IA & Clima Político */}
        {sessao.resumo && (
          <div className="my-3 rounded-2xl bg-slate-950/80 p-3.5 border border-slate-800 text-xs text-slate-200 leading-relaxed shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 uppercase tracking-wider text-[11px] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resumo Executivo da Sessão</span>
            </div>
            {sessao.resumo}
          </div>
        )}

        {/* Barra de Filtros: Busca, Seletor de Modo, Oradores e Tags */}
        <div className="py-2.5 border-b border-slate-800 shrink-0 space-y-2.5">
          {/* Linha 1: Busca + Alternador de Visualização + Copiar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por assunto, vereador, palavra-chave (ex: UPA, asfalto, Saulo, Limoeiro)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Alternador de Modo: Parágrafos Fluídos vs Linha por Linha */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode("discursos")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === "discursos"
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Falas agrupadas em parágrafos contínuos e fluídos (leitura natural para humanos)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Modo Parágrafos</span>
                </button>
                <button
                  onClick={() => setViewMode("linhas")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === "linhas"
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Legendas fragmentadas linha por linha originais do YouTube"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Linha por Linha</span>
                </button>
              </div>

              {/* Botão Copiar */}
              <button
                onClick={handleCopyTranscript}
                disabled={(viewMode === "discursos" ? filteredDiscursos.length : filteredLinhas.length) === 0}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copiar Trechos</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filtro 1: Oradores na Tribuna */}
          {availableSpeakers.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <User className="w-3 h-3 text-emerald-400" />
                Orador:
              </span>
              <button
                onClick={() => setSelectedSpeaker("TODOS")}
                className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  selectedSpeaker === "TODOS"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                }`}
              >
                <span>Todos</span>
                <span className="rounded-full bg-slate-950/40 px-1.5 py-0.2 text-[10px]">
                  {speakerCounts["TODOS"] || 0}
                </span>
              </button>

              {availableSpeakers.map((spk) => (
                <button
                  key={spk}
                  onClick={() => setSelectedSpeaker(spk)}
                  className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedSpeaker === spk
                      ? "bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-400/20"
                      : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                  }`}
                >
                  <span>{spk}</span>
                  <span className="rounded-full bg-slate-950/40 px-1.5 py-0.2 text-[10px]">
                    {speakerCounts[spk] || 0}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Filtro 2: Tags de Pautas / Temas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-amber-400" />
              Pauta:
            </span>
            <button
              onClick={() => setSelectedTag("TODAS")}
              className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedTag === "TODAS"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              <span>Todas</span>
              <span className="rounded-full bg-slate-950/40 px-1.5 py-0.2 text-[10px]">
                {tagCounts["TODAS"] || 0}
              </span>
            </button>

            {availableTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedTag === t
                    ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20"
                    : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                }`}
              >
                <span>{t}</span>
                <span className="rounded-full bg-slate-950/40 px-1.5 py-0.2 text-[10px]">
                  {tagCounts[t] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Discursos / Falas */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Carregando transcrição detalhada da sessão...
            </div>
          ) : viewMode === "discursos" ? (
            /* MODO DISCURSOS (PARÁGRAFOS HUMANOS FLUÍDOS) */
            filteredDiscursos.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-slate-950/50 border border-slate-800">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400">
                  Nenhum discurso encontrado com os filtros selecionados.
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
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
                    className="group rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 hover:border-slate-700 hover:bg-slate-950 transition flex flex-col gap-2.5 shadow-sm"
                  >
                    {/* Cabeçalho do Bloco: Orador, Pauta e Link com Tempo */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Selo do Orador */}
                        <button
                          onClick={() => setSelectedSpeaker(spk)}
                          title={`Filtrar falas de ${spk}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isCouncilor
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                              : spk === "Mesa Diretora"
                              ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25"
                              : "bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25"
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>{spk}</span>
                        </button>

                        {/* Selo da Pauta Temática */}
                        {d.tema && d.tema !== "Debates Gerais" && (
                          <button
                            onClick={() => setSelectedTag(d.tema)}
                            title={`Filtrar apenas por ${d.tema}`}
                            className="rounded-lg bg-amber-400/10 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/25 hover:bg-amber-400/20 transition cursor-pointer"
                          >
                            🏷️ {d.tema}
                          </button>
                        )}
                      </div>

                      {/* Timestamp com Play no YouTube */}
                      <a
                        href={d.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvir este trecho na íntegra no YouTube"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-2.5 py-1 text-xs font-mono font-bold text-red-400 hover:text-red-300 transition group/btn"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{d.timeStartStr} → {d.timeEndStr}</span>
                        <span className="text-[10px] text-red-400/80 font-sans">({d.durationSec}s)</span>
                        <ExternalLink className="w-3 h-3 opacity-70 group-hover/btn:translate-x-0.5 transition" />
                      </a>
                    </div>

                    {/* Texto Fluído e Contínuo do Discurso */}
                    <p className="text-sm text-slate-200 leading-relaxed select-text font-normal pl-0.5">
                      "{d.text}"
                    </p>
                  </div>
                );
              })
            )
          ) : (
            /* MODO LINHA POR LINHA (LEGENDAS ISOLADAS) */
            filteredLinhas.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-slate-950/50 border border-slate-800">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400">
                  Nenhuma fala encontrada com os filtros selecionados.
                </p>
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
                    className="group rounded-2xl border border-slate-800/90 bg-slate-950/60 p-3 hover:border-slate-700 hover:bg-slate-950 transition flex flex-col sm:flex-row items-start gap-3"
                  >
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1.5">
                      <a
                        href={fala.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvir este trecho no YouTube"
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-mono font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{fala.timeStr}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>

                      {fala.tema && fala.tema !== "Debates Gerais" && (
                        <button
                          onClick={() => setSelectedTag(fala.tema)}
                          className="rounded-md bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/20 hover:bg-amber-400/20 transition cursor-pointer text-left"
                        >
                          🏷️ {fala.tema}
                        </button>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => setSelectedSpeaker(spk)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                            isCouncilor
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                              : spk === "Mesa Diretora"
                              ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25"
                              : "bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25"
                          }`}
                        >
                          <User className="w-2.5 h-2.5" />
                          <span>{spk}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed select-text">
                        "{fala.text}"
                      </p>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>
            {viewMode === "discursos" ? (
              <>
                Exibindo <strong>{filteredDiscursos.length}</strong> intervenções fluídas estruturadas (a partir de{" "}
                <strong>{fullTranscripts.length}</strong> legendas do YouTube)
              </>
            ) : (
              <>
                Exibindo <strong>{filteredLinhas.length}</strong> de{" "}
                <strong>{fullTranscripts.length}</strong> frases curtas
              </>
            )}
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
