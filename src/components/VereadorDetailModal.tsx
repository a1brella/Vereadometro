"use client";

import React from "react";
import { ArrowRight, ExternalLink, Share2 } from "lucide-react";
import { VereadorWithDetails } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { ModalShell, Torn, WhatsIcon } from "@/components/editorial/Editorial";

interface VereadorDetailModalProps {
  vereador: VereadorWithDetails | null;
  onClose: () => void;
  onFollow: (vereador: VereadorWithDetails) => void;
  onShare: (vereador: VereadorWithDetails) => void;
}

/** Cabeçalho de seção do dossiê: título, contagem e fonte alinhados numa linha. */
function SectionHead({
  id,
  title,
  count,
  source,
}: {
  id: string;
  title: string;
  count?: number;
  source: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink pb-2">
      <h3 id={id} className="font-display text-[24px] leading-none sm:text-[30px]">
        {title}
        {count !== undefined && <span className="ml-2 bg-yellow px-1.5">({count})</span>}
      </h3>
      <span className="inline-flex items-center gap-1.5 font-type text-[13px] font-bold uppercase tracking-[0.04em] text-ink-2">
        {source}
      </span>
    </div>
  );
}

export const VereadorDetailModal: React.FC<VereadorDetailModalProps> = ({ vereador, onClose, onFollow, onShare }) => {
  if (!vereador) return null;

  const custoAssessores = vereador.totalAssessores * 2800;
  const gabinete = Math.max(0, vereador.totalGastoMes - vereador.salarioBase - custoAssessores);
  const zero = vereador.totalProjetos === 0;

  const extrato = [
    { label: "Salário Base", value: vereador.salarioBase },
    { label: "Custo Assessores", value: custoAssessores },
    { label: "Gabinete / CEAP", value: gabinete },
  ];

  return (
    <ModalShell
      onClose={onClose}
      label={`Auditoria do gabinete de ${vereador.nomeParlamentar}`}
      className="max-w-3xl bg-transparent shadow-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
    >
      {/* Folha clara rasgada (o recorte fica aqui dentro para não cortar o botão de fechar) */}
      <Torn seed={101} jag={8} shadow={false} className="bg-[#f0eadc]" innerClassName="isolate overflow-hidden">
        <Torn seed={103} edges="t" jag={6} shadow={false} className="pointer-events-none absolute -bottom-1 left-0 z-10 h-5 w-full bg-blue" />

        <div className="thin-scroll relative isolate max-h-[88vh] overflow-y-auto px-5 pb-14 pt-6 sm:px-10">
          {/* Canto de papel vermelho: rola junto com o conteúdo */}
          <Torn seed={102} edges="rb" jag={7} className="absolute -left-2 -top-2 -z-10 h-28 w-[42%] bg-red" />

          {/* Topo: posição e selo da auditoria */}
          <div className="flex items-start justify-between gap-3">
            <p className="tag-paper relative -rotate-2 font-display text-[22px] leading-none sm:text-[26px]">
              #{vereador.rankingGeral} no ranking
            </p>
            <p className="mr-8 font-display text-[16px] sm:text-[20px]">
              <span className="tag-hl">Auditoria Cidadã 2026</span>
            </p>
          </div>

          {/* Identificação */}
          <div className="mt-7 flex items-center gap-5 sm:gap-7">
            <div className="shrink-0 -rotate-2 bg-sheet p-1.5 shadow-[0_3px_8px_rgba(21,19,17,0.3)]">
              <img
                src={vereador.fotoUrl}
                alt={vereador.nomeParlamentar}
                className="bw h-[112px] w-[90px] object-cover object-top sm:h-[140px] sm:w-[112px]"
              />
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-[clamp(34px,5.4vw,56px)] leading-[0.95]">{vereador.nomeParlamentar}</h2>
              <p className="mt-2 text-[15px] font-semibold uppercase tracking-[0.03em] text-ink-2">{vereador.nomeCompleto}</p>
              <p className="mt-3 flex flex-wrap items-center gap-2.5 text-[15px]">
                <span className="bg-blue px-2 py-0.5 font-display text-[17px] leading-none text-white">{vereador.partido}</span>
                <span>
                  <strong className="tabular">{formatNumber(vereador.votosUltimaEleicao)}</strong> votos eleitos
                </span>
              </p>
            </div>
          </div>

          {/* Resumo em uma linha: o que importa num relance */}
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border-2 border-ink bg-ink sm:grid-cols-4">
            <div className="bg-red px-4 py-3 text-white">
              <dt className="text-[13px] font-bold uppercase tracking-[0.04em]">Total / Mês</dt>
              <dd className="tabular mt-0.5 text-[24px] font-extrabold leading-tight sm:text-[26px]">
                {formatCurrency(vereador.totalGastoMes)}
              </dd>
            </div>
            <div className="bg-[#f0eadc] px-4 py-3">
              <dt className="text-[13px] font-bold uppercase tracking-[0.04em] text-ink-2">Assessores</dt>
              <dd className="tabular mt-0.5 text-[24px] font-extrabold leading-tight sm:text-[26px]">{vereador.totalAssessores}</dd>
            </div>
            <div className="bg-[#f0eadc] px-4 py-3">
              <dt className="text-[13px] font-bold uppercase tracking-[0.04em] text-ink-2">Projetos</dt>
              <dd className={`tabular mt-0.5 text-[24px] font-extrabold leading-tight sm:text-[26px] ${zero ? "text-red" : ""}`}>
                {vereador.totalProjetos}
              </dd>
            </div>
            <div className="bg-[#f0eadc] px-4 py-3">
              <dt className="text-[13px] font-bold uppercase tracking-[0.04em] text-ink-2">Presença</dt>
              <dd className="tabular mt-0.5 text-[24px] font-extrabold leading-tight sm:text-[26px]">{vereador.taxaPresenca}%</dd>
            </div>
          </dl>

          {/* Ações */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 rounded-[14px] outline-offset-4 outline-blue has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFollow(vereador);
                }}
                className="group flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-3 rounded-[12px] bg-[#128c4a] px-5 font-display text-[18px] text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.22),0_4px_10px_-2px_rgba(21,19,17,0.28)] transition-[background-color,color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-[#0d6e3a] focus-visible:outline-none active:translate-y-px active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.22),0_1px_3px_rgba(21,19,17,0.2)] sm:text-[20px]"
              >
                <WhatsIcon className="size-6 shrink-0" />
                Receber Alertas deste Vereador no Zap
                <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onShare(vereador)}
              className="flex min-h-[56px] cursor-pointer items-center justify-center gap-3 rounded-[12px] border-2 border-ink px-6 font-display text-[18px] shadow-[inset_0_-3px_0_rgba(0,0,0,0.12)] transition-[background-color,color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-ink hover:text-paper active:translate-y-px active:shadow-none sm:text-[20px]"
            >
              <Share2 className="size-5" aria-hidden />
              Compartilhar
            </button>
          </div>

          {/* Biografia / Contexto */}
          {vereador.biografia && (
            <p className="mt-7 border-l-4 border-yellow pl-4 text-[16px] leading-[1.6] text-ink-2">{vereador.biografia}</p>
          )}

          {/* Extrato financeiro: linhas de livro-caixa, valores alinhados à direita */}
          <section className="mt-10" aria-labelledby="extrato-titulo">
            <SectionHead id="extrato-titulo" title="Extrato Financeiro Mensal do Gabinete" source="Valores / mês" />
            <dl>
              {extrato.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-ink/20 py-3">
                  <dt className="text-[16px]">{row.label}</dt>
                  <dd className="tabular text-[19px] font-bold">{formatCurrency(row.value)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[16px] font-bold uppercase tracking-[0.03em]">Total / Mês</dt>
                <dd className="tabular bg-red px-2 text-[22px] font-extrabold text-white">{formatCurrency(vereador.totalGastoMes)}</dd>
              </div>
            </dl>
          </section>

          {/* Assessores */}
          <section className="mt-10" aria-labelledby="assessores-titulo">
            <SectionHead
              id="assessores-titulo"
              title="Assessores Nomeados no Gabinete"
              count={vereador.totalAssessores}
              source={
                <>
                  Portal da Transparência <ExternalLink className="size-3.5" aria-hidden />
                </>
              }
            />

            {vereador.assessores && vereador.assessores.length > 0 ? (
              <>
                <p className="flex justify-between pt-3 text-[12px] font-bold uppercase tracking-[0.05em] text-mute">
                  <span>Nome e cargo</span>
                  <span>Remuneração Bruta</span>
                </p>
                <ol>
                  {vereador.assessores.map((assessor, i) => (
                    <li key={assessor.id} className="flex items-center gap-4 border-b border-ink/20 py-3 last:border-b-0">
                      <span className="tabular w-6 shrink-0 text-right text-[14px] font-bold text-mute">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[16px] font-bold">{assessor.nome}</p>
                        <p className="truncate text-[14px] text-ink-2">{assessor.cargo}</p>
                      </div>
                      <p className="tabular shrink-0 text-[17px] font-bold">{formatCurrency(assessor.remuneracaoBruta)}</p>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="py-5 text-center text-[16px] text-ink-2">
                Assessores sob sigilo ou em fase de recadastramento no Diário Oficial.
              </p>
            )}
          </section>

          {/* Produção legislativa */}
          <section className="mt-10" aria-labelledby="projetos-titulo">
            <SectionHead
              id="projetos-titulo"
              title="Matérias e Projetos Apresentados"
              count={vereador.totalProjetos}
              source="SAPL / Portal da Câmara"
            />

            {zero ? (
              <div className="mt-4 rounded-[10px] border-2 border-red p-5 text-center">
                <p className="font-display text-[22px] text-red">Nenhum projeto de lei apresentado neste exercício</p>
                <p className="mt-2 text-[16px] leading-snug">
                  Apesar de custar mais de {formatCurrency(vereador.totalGastoAno)} aos cofres públicos, o vereador ainda não
                  protocolou projetos legislativos em 2026.
                </p>
              </div>
            ) : vereador.projetos && vereador.projetos.length > 0 ? (
              <ol>
                {vereador.projetos.map((proj) => (
                  <li key={proj.id} className="border-b border-ink/20 py-4 last:border-b-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular bg-ink px-2 py-0.5 text-[13px] font-bold text-paper">{proj.numero}</span>
                      <span
                        className={`rounded-full border-2 px-2 text-[12px] font-bold uppercase ${
                          proj.status === "APROVADO" ? "border-leaf text-leaf" : "border-blue text-blue"
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>
                    <p className="mt-2 text-[17px] font-bold leading-snug">{proj.titulo}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{proj.ementa}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-5 text-center text-[16px] text-ink-2">Projetos em processo de indexação no portal legislativo.</p>
            )}
          </section>
        </div>
      </Torn>
    </ModalShell>
  );
};
