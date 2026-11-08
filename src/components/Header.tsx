import React from "react";
import { ShieldAlert, BellRing, FileSignature, Landmark, Flame } from "lucide-react";

interface HeaderProps {
  onOpenLeadModal: (vereadorId?: string) => void;
  onScrollToRanking: () => void;
  onScrollToIniciativa: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLeadModal,
  onScrollToRanking,
  onScrollToIniciativa,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Faixa superior de urgência cívica */}
      <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 px-4 py-1.5 text-center text-xs font-semibold text-white tracking-wide flex items-center justify-center gap-2">
        <Flame className="w-4 h-4 animate-pulse text-yellow-200" />
        <span>
          <strong>AUDITORIA CIDADÃ 2026:</strong> Fiscalize o custo dos 21 vereadores de Juazeiro do Norte / CE
        </span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white sm:text-xl">
                VEREADÔMETRO
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                JUAZEIRO / CE
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Transparência Cívica & Fiscalização da Câmara Municipal
            </p>
          </div>
        </div>

        {/* Links de Ação Rápida */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onScrollToRanking}
            className="hidden text-xs font-medium text-slate-300 hover:text-white md:inline-flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-800 transition"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Ranking de Gastos
          </button>

          <button
            onClick={onScrollToIniciativa}
            className="hidden text-xs font-medium text-slate-300 hover:text-white md:inline-flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-800 transition"
          >
            <FileSignature className="w-4 h-4 text-emerald-400" />
            Projeto Trava-Salário
          </button>

          {/* Botão de Conversão Principal */}
          <button
            onClick={() => onOpenLeadModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition"
          >
            <BellRing className="h-4 w-4 fill-slate-950" />
            <span>Alerta no Zap</span>
          </button>
        </div>
      </div>
    </header>
  );
};
