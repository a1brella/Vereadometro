import React, { useState } from "react";
import { Video, Radio, MessageSquare, ExternalLink, Tag, Sparkles, ChevronRight } from "lucide-react";
import { SessaoDetailModal, SessaoDetail } from "@/components/SessaoDetailModal";

interface SessoesTranscritasSectionProps {
  sessoes: SessaoDetail[];
}

export const SessoesTranscritasSection: React.FC<SessoesTranscritasSectionProps> = ({ sessoes }) => {
  const [selectedSessao, setSelectedSessao] = useState<SessaoDetail | null>(null);
  const [initialTag, setInitialTag] = useState<string | null>(null);

  if (!sessoes || sessoes.length === 0) return null;

  const handleOpenModal = (sessao: SessaoDetail, tag?: string) => {
    setSelectedSessao(sessao);
    setInitialTag(tag || null);
  };

  return (
    <>
      <section className="py-12 px-4 sm:px-6 mx-auto max-w-7xl border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
              <span>TRANSCRIÇÃO AUTOMÁTICA EM TEMPO REAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              O que os vereadores estão falando na Tribuna?
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Nosso robô consome as transmissões da TV Câmara Juazeiro no YouTube e transcreve automaticamente os debates. <strong>Clique em qualquer sessão ou tag para ler na íntegra o que foi falado.</strong>
            </p>
          </div>

          <a
            href="https://www.youtube.com/@camaramunicipaldejuazeirod6521/streams"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Video className="w-4 h-4 text-red-500" />
            <span>Ver Canal Oficial no YouTube</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessoes.map((s) => (
            <div
              key={s.id}
              onClick={() => handleOpenModal(s)}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur hover:border-emerald-500/60 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[11px] font-black text-red-400 uppercase tracking-wide">
                      🏛️ {s.numeroSessao || "Sessão Plenária"}
                    </span>
                    {s.dataFormatada && (
                      <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1">
                        📅 {s.dataFormatada}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    {s.totalFalas.toLocaleString("pt-BR")} falas
                  </span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-white leading-snug group-hover:text-emerald-400 transition">
                  {s.titulo}
                </h3>

                {s.resumo && (
                  <p className="mt-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800/60">
                    {s.resumo}
                  </p>
                )}

                {/* Tags Clicáveis que filtram direto as falas */}
                {s.temasDiscutidos && s.temasDiscutidos.length > 0 && (
                  <div className="mt-3.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                      Clique na pauta para ver os trechos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {s.temasDiscutidos.map((tema) => (
                        <button
                          key={tema}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(s, tema);
                          }}
                          className="rounded-lg bg-slate-800/90 hover:bg-amber-400 hover:text-slate-950 border border-slate-700/80 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition active:scale-95 flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tema}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Clique para abrir transcrição na íntegra
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400 group-hover:translate-x-1 transition">
                  <span>Abrir Transcrição & Falas</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Interativo com Busca e Filtros por Tag */}
      <SessaoDetailModal
        sessao={selectedSessao}
        initialTag={initialTag}
        onClose={() => setSelectedSessao(null)}
      />
    </>
  );
};
