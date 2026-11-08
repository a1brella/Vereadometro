"use client";

import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VereadorWithDetails } from "@/lib/types";
import { InkImage, ModalShell } from "@/components/editorial/Editorial";

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
    <ModalShell onClose={onClose} label="Card compartilhável" className="max-w-lg">
      <div className="thin-scroll max-h-[92vh] overflow-y-auto p-5 sm:p-7">
        <div className="flex items-center gap-2 text-[14px] font-bold text-red">
          <span>Card Compartilhável para Redes e Grupos</span>
        </div>

        <h2 className="mt-2 font-display text-[26px] leading-[1] text-ink sm:text-[30px]">Espalhe a verdade sobre os gastos públicos</h2>
        <p className="mt-2 text-[16px] leading-snug text-ink-2">
          Compartilhe este extrato com amigos, familiares e grupos do bairro no WhatsApp.
        </p>

        {/* Visual do Card — cartaz de colagem */}
        <div className="relative mt-6 overflow-hidden border-[1.5px] border-ink bg-blue text-paper">
          <InkImage
            src="/collage/xilogravura-ink.webp"
            color="rgba(255, 201, 40, 0.22)"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64"
          />
          <div className="relative flex items-center justify-between border-b border-paper/30 px-4 py-2.5">
            <span className="text-[13px] font-bold text-yellow">Vereadômetro Juazeiro / CE</span>
            <span className="stamp !text-[11px] text-paper">AUDITORIA 2026</span>
          </div>

          <div className="relative flex items-end gap-4 px-4 pt-4">
            <div className="duo h-[104px] w-[84px] shrink-0 rotate-[-3deg] border-2 border-paper duo-red">
              <img src={vereador.fotoUrl} alt={vereador.nomeParlamentar} className="h-full w-full object-cover object-top" />
            </div>
            <div className="min-w-0 pb-1">
              <span className="text-[13px] font-bold text-yellow">{vereador.partido}</span>
              <h3 className="font-display text-[24px] leading-[0.95]">{vereador.nomeParlamentar}</h3>
              <p className="truncate text-[14px] text-paper/90">{vereador.nomeCompleto}</p>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-2 border-t border-paper/30">
            <div className="border-b border-r border-paper/30 p-3">
              <span className="text-[13px] text-paper/90">Custo Mensal</span>
              <div className="font-display text-[19px] leading-none text-yellow">{formatCurrency(vereador.totalGastoMes)}</div>
            </div>
            <div className="border-b border-paper/30 p-3">
              <span className="text-[13px] text-paper/90">Gasto no Ano</span>
              <div className="font-display text-[19px] leading-none">{formatCurrency(vereador.totalGastoAno)}</div>
            </div>
            <div className="border-r border-paper/30 p-3">
              <span className="text-[13px] text-paper/90">Assessores</span>
              <div className="font-display text-[17px] leading-none">{vereador.totalAssessores} contratados</div>
            </div>
            <div className={`p-3 ${vereador.totalProjetos === 0 ? "bg-red" : ""}`}>
              <span className="text-[13px] text-paper/90">Projetos Entregues</span>
              <div className="font-display text-[17px] leading-none">
                {vereador.totalProjetos} {vereador.totalProjetos === 0 ? "(Zero!)" : "projetos"}
              </div>
            </div>
          </div>

          <div className="relative bg-ink px-4 py-2.5 text-center text-[12px] text-paper/85">
            Fonte: Dados abertos da Câmara Municipal e TCE-CE • vereadometro-juazeiro.com.br
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="flex-1">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <span>Enviar no WhatsApp</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
          </Button>

          <Button onClick={handleCopy} variant="outline" size="lg">
            {copied ? (
              <>
                <span className="text-leaf">Copiado!</span>
              </>
            ) : (
              <>
                <span>Copiar Texto</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};
