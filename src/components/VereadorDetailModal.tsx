import React from "react";
import { X, Users, DollarSign, FileText, BellRing, Building2, CheckCircle } from "lucide-react";
import { VereadorWithDetails } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface VereadorDetailModalProps {
  vereador: VereadorWithDetails | null;
  onClose: () => void;
  onFollow: (vereador: VereadorWithDetails) => void;
}

export const VereadorDetailModal: React.FC<VereadorDetailModalProps> = ({
  vereador,
  onClose,
  onFollow,
}) => {
  if (!vereador) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do Vereador */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <img
            src={vereador.fotoUrl}
            alt={vereador.nomeParlamentar}
            className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-bold text-amber-400 border border-slate-700">
                {vereador.partido}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {vereador.votosUltimaEleicao} votos eleitos
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-white">
              {vereador.nomeParlamentar}
            </h2>
            <p className="text-xs text-slate-400">{vereador.nomeCompleto}</p>
          </div>
        </div>

        {/* Biografia / Contexto */}
        {vereador.biografia && (
          <p className="mt-4 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {vereador.biografia}
          </p>
        )}

        {/* Discriminativo Financeiro do Gabinete */}
        <div className="mt-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Extrato Financeiro Mensal do Gabinete</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Salário Base</span>
              <div className="text-sm font-black text-white mt-0.5">
                {formatCurrency(vereador.salarioBase)}
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Custo Assessores</span>
              <div className="text-sm font-black text-sky-400 mt-0.5">
                {formatCurrency(vereador.totalAssessores * 2800)}
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Gabinete / CEAP</span>
              <div className="text-sm font-black text-amber-400 mt-0.5">
                {formatCurrency(Math.max(0, vereador.totalGastoMes - vereador.salarioBase - (vereador.totalAssessores * 2800)))}
              </div>
            </div>

            <div className="rounded-xl bg-emerald-950/40 p-3 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Total / Mês</span>
              <div className="text-sm font-black text-emerald-300 mt-0.5">
                {formatCurrency(vereador.totalGastoMes)}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Assessores do Gabinete */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Assessores Nomeados no Gabinete ({vereador.totalAssessores})</span>
            </h3>
            <span className="text-xs text-slate-400">Portal da Transparência</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden divide-y divide-slate-800/80">
            {vereador.assessores && vereador.assessores.length > 0 ? (
              vereador.assessores.map((assessor) => (
                <div key={assessor.id} className="p-3 flex items-center justify-between hover:bg-slate-900/50 transition">
                  <div>
                    <div className="text-xs font-bold text-white">{assessor.nome}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>{assessor.cargo}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400">
                      {formatCurrency(assessor.remuneracaoBruta)}
                    </span>
                    <div className="text-[10px] text-slate-500">Remuneração Bruta</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Assessores sob sigilo ou em fase de recadastramento no Diário Oficial.
              </div>
            )}
          </div>
        </div>

        {/* Produção Legislativa */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Matérias e Projetos Apresentados ({vereador.totalProjetos})</span>
            </h3>
            <span className="text-xs text-slate-400">SAPL / Portal da Câmara</span>
          </div>

          {vereador.totalProjetos === 0 ? (
            <div className="rounded-2xl bg-red-950/30 border border-red-800/50 p-4 text-center">
              <p className="text-xs font-bold text-red-300">
                ⚠️ NENHUM PROJETO DE LEI APRESENTADO NESTE EXERCÍCIO
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Apesar de custar mais de {formatCurrency(vereador.totalGastoAno)} aos cofres públicos, o vereador ainda não protocolou projetos legislativos em 2026.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 divide-y divide-slate-800/80 overflow-hidden max-h-72 overflow-y-auto">
              {vereador.projetos && vereador.projetos.length > 0 ? (
                vereador.projetos.map((proj) => (
                  <div key={proj.id} className="p-3.5 hover:bg-slate-900/50 transition">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        <FileText className="w-3 h-3" />
                        {proj.numero}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          proj.status === "APROVADO"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-sky-400 bg-sky-500/10 border-sky-500/20"
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 leading-snug">
                      {proj.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {proj.ementa}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Projetos em processo de indexação no portal legislativo.
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA do Modal */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onFollow(vereador);
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
          >
            <BellRing className="w-4 h-4 fill-slate-950" />
            <span>Receber Alertas deste Vereador no Zap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
