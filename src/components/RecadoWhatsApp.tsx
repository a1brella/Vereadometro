"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { WhatsIcon } from "@/components/editorial/Editorial";

/** Convite para acompanhar no WhatsApp, logo depois do ranking. */
export function RecadoWhatsApp({ onOpenLeadModal }: { onOpenLeadModal: () => void }) {
  return (
    <section className="stack paper-rose overflow-hidden">
      <div className="page section-y">
        <div className="mx-auto max-w-[920px] text-center" data-reveal>
          <h3 className="font-display text-[clamp(44px,6vw,92px)] leading-[0.95] text-ink">
            Não deixe o dinheiro da sua cidade sumir <span className="tag-hl">sem explicação</span>
          </h3>
          <p className="mx-auto mt-7 max-w-[46ch] font-type text-[18px] leading-[1.6] text-ink">
            Cadastre seu WhatsApp e receba alertas quando seu vereador gastar verba de gabinete ou nomear assessores.
          </p>
          <div className="mt-10 inline-block rounded-[14px] outline-offset-4 outline-blue has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px]">
            <button
              type="button"
              onClick={onOpenLeadModal}
              className="group inline-flex min-h-[60px] cursor-pointer items-center gap-3 rounded-[12px] bg-[#128c4a] px-8 font-display text-[22px] text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.22),0_4px_10px_-2px_rgba(21,19,17,0.28)] transition-[background-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-[#0d6e3a] focus-visible:outline-none active:translate-y-px active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.22),0_1px_3px_rgba(21,19,17,0.2)] sm:text-[26px]"
            >
              <WhatsIcon className="size-7" />
              Quero Receber no WhatsApp
              <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
