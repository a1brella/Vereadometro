import React, { useState } from "react";
import { X, Check, Copy, MessageCircle, ExternalLink, ShieldAlert } from "lucide-react";
import { VereadorWithDetails } from "@/lib/types";

interface ShareCardModalProps {
  vereador: VereadorWithDetails | null;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ vereador, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!vereador) return null;

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const shareText =
    `🚨 *QUANTO CUSTA O VEREADOR ${vereador.nomeParlamentar.toUpperCase()} EM JUAZEIRO DO NORTE?*\n\n` +
    `🏛️ *Partido:* ${vereador.partido}\n` +
    `💰 *Custo no mês:* ${formatCurrency(vereador.totalGastoMes)}\n` +
    `📈 *Total acumulado em 2026:* ${formatCurrency(vereador.totalGastoAno)}\n` +
    `👥 *Assessores nomeados:* ${vereador.totalAssessores} pessoas\n` +
    `📄 *Projetos apresentados:* ${vereador.totalProjetos} ${vereador.totalProjetos === 0 ? "⚠️ (ZERO PROJETOS!)" : ""}\n` +
    `📊 *Presença em plenário:* ${vereador.taxaPresenca}%\n\n` +
    `Fiscalize todos os 21 vereadores de Juazeiro do Norte no *Vereadômetro*:\n` +
    `👉 https://vereadometro-juazeiro.com.br?v=${vereador.slug}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl overflow-hidden">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Card Compartilhável para Redes e Grupos</span>
        </div>

        <h2 className="text-xl font-black text-white">
          Espalhe a verdade sobre os gastos públicos
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Compartilhe este extrato com amigos, familiares e grupos do bairro no WhatsApp.
        </p>

        {/* Visual do Card Estilo Story / Print */}
        <div className="mt-5 rounded-2xl border-2 border-slate-700 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
              🏛️ Vereadômetro Juazeiro / CE
            </span>
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
              AUDITORIA 2026
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <img
              src={vereador.fotoUrl}
              alt={vereador.nomeParlamentar}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-amber-500/60 shadow"
            />
            <div>
              <span className="text-xs font-bold text-amber-400">{vereador.partido}</span>
              <h3 className="text-lg font-black text-white">{vereador.nomeParlamentar}</h3>
              <p className="text-xs text-slate-400">{vereador.nomeCompleto}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-left">
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Custo Mensal</span>
              <div className="text-base font-black text-emerald-400">
                {formatCurrency(vereador.totalGastoMes)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Gasto no Ano</span>
              <div className="text-base font-black text-white">
                {formatCurrency(vereador.totalGastoAno)}
              </div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-left">
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Assessores</span>
              <div className="text-base font-black text-sky-400">
                {vereador.totalAssessores} contratados
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Projetos Entregues</span>
              <div className={`text-base font-black ${vereador.totalProjetos === 0 ? "text-red-400" : "text-amber-400"}`}>
                {vereador.totalProjetos} {vereador.totalProjetos === 0 ? "⚠️ (Zero!)" : "projetos"}
              </div>
            </div>
          </div>

          <div className="mt-3 text-center text-[10px] text-slate-400">
            Fonte: Dados abertos da Câmara Municipal e TCE-CE • vereadometro-juazeiro.com.br
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-3 px-4 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950" />
            <span>Enviar no WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm py-3 px-4 active:scale-95 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
