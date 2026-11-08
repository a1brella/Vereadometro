"use client";

import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <section id="tribuna" className="stack scroll-mt-16 overflow-hidden !bg-ink text-paper">
        <div className="page section-y">

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 text-[14px] font-bold text-yellow">
                <span>TRANSCRIÇÃO AUTOMÁTICA EM TEMPO REAL</span>
              </div>
              <h2 className="mt-5" data-reveal="lines">
                <span className="line-mask">
                  <span className="h-section">O que os vereadores</span>
                </span>
                <span className="line-mask">
                  <span className="h-section">
                    estão falando na{" "}
                    <span className="text-yellow">Tribuna?</span>
                  </span>
                </span>
              </h2>
              <p className="mt-6 max-w-[60ch] text-[18px] leading-[1.6] text-paper/90">
                Nosso robô consome as transmissões da TV Câmara Juazeiro no YouTube e transcreve automaticamente os debates.{" "}
                <strong className="font-semibold text-paper">
                  Clique em qualquer sessão ou tag para ler na íntegra o que foi falado.
                </strong>
              </p>

              <Button asChild variant="link" className="mt-6 text-paper hover:decoration-yellow">
                <a
                  href="https://www.youtube.com/@camaramunicipaldejuazeirod6521/streams"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver Canal Oficial no YouTube
                  <ExternalLink aria-hidden />
                </a>
              </Button>
            </div>

            {/* Foto documental: romeiros à luz de velas */}
            <figure className="relative hidden lg:col-span-4 lg:block" data-reveal="clip">
              <div>
                <img
                  src="/collage/romeiro-vela-ht.webp"
                  alt="Romeiro segurando vela em Juazeiro do Norte"
                  className="torn-tb w-full rotate-[2deg] object-cover"
                />
                <figcaption className="mt-3 text-[13px] text-paper/75">
                  Romaria · Juazeiro do Norte — fé, povo e poder público
                </figcaption>
              </div>
            </figure>
          </div>

          {/* Pauta das sessões: uma linha por sessão, como a agenda de um jornal */}
          <ol className="mt-14 border-t-2 border-paper/80">
            {sessoes.map((s) => (
              <li key={s.id} className="border-b border-paper/25" data-reveal>
                <div className="group grid grid-cols-1 gap-x-10 gap-y-3 py-8 lg:grid-cols-[12rem_minmax(0,1fr)_14rem]">
                  {/* Quando */}
                  <div className="text-[15px] text-paper/85">
                    <p className="font-bold text-paper">{s.dataFormatada}</p>
                    <p>{s.numeroSessao || "Sessão Plenária"}</p>
                    <p className="tabular mt-1">{s.totalFalas.toLocaleString("pt-BR")} falas</p>
                  </div>

                  {/* O quê */}
                  <div className="min-w-0">
                    <h3>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(s)}
                        className="cursor-pointer text-left text-[clamp(22px,2.4vw,30px)] font-extrabold leading-[1.15] tracking-[-0.01em] text-paper underline-offset-[6px] hover:underline"
                      >
                        {s.titulo}
                      </button>
                    </h3>
                    {s.resumo && <p className="mt-3 max-w-[62ch] text-[16px] leading-[1.6] text-paper/85">{s.resumo}</p>}

                    {s.temasDiscutidos && s.temasDiscutidos.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-[14px] text-paper/75">Clique na pauta para ver os trechos:</span>
                        {s.temasDiscutidos.map((tema) => (
                          <button
                            key={tema}
                            type="button"
                            onClick={() => handleOpenModal(s, tema)}
                            className="min-h-9 cursor-pointer rounded-[2px] border-2 border-paper/70 px-3 text-[14px] font-semibold text-paper transition-colors hover:border-yellow hover:bg-yellow hover:text-ink"
                          >
                            {tema}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ação */}
                  <div className="lg:text-right">
                    <Button variant="paper" onClick={() => handleOpenModal(s)}>
                      Abrir Transcrição &amp; Falas
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Modal Interativo com Busca e Filtros por Tag */}
      <SessaoDetailModal sessao={selectedSessao} initialTag={initialTag} onClose={() => setSelectedSessao(null)} />
    </>
  );
};
