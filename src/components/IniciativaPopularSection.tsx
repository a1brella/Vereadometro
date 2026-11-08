"use client";

import React, { useState } from "react";
import { InkImage, PenArrow, PenUnderline, tornClip } from "@/components/editorial/Editorial";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IniciativaPopularSectionProps {
  initialCount?: number;
  targetCount?: number;
}

export const IniciativaPopularSection: React.FC<IniciativaPopularSectionProps> = ({
  initialCount = 1420,
  targetCount = 5000,
}) => {
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [tituloEleitor, setTituloEleitor] = useState("");
  const [zonaEleitoral, setZonaEleitoral] = useState("028");
  const [secaoEleitoral, setSecaoEleitoral] = useState("");
  const [bairro, setBairro] = useState("Centro");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentTotal, setCurrentTotal] = useState(initialCount);

  const percentage = Math.min(100, Math.round((currentTotal / targetCount) * 100));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 11) {
      let formatted = raw;
      if (raw.length > 2) formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
      if (raw.length > 7) formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
      setWhatsapp(formatted);
    }
  };

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 12) {
      // Formato título: 0000 0000 0000
      let formatted = raw;
      if (raw.length > 4) formatted = `${raw.slice(0, 4)} ${raw.slice(4)}`;
      if (raw.length > 8) formatted = `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8, 12)}`;
      setTituloEleitor(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanTitulo = tituloEleitor.replace(/\D/g, "");
    const cleanPhone = whatsapp.replace(/\D/g, "");

    if (cleanTitulo.length < 10) {
      setErrorMsg("O Título de Eleitor deve conter pelo menos 10 a 12 dígitos.");
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMsg("Informe um WhatsApp válido com DDD.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/assinaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto,
          tituloEleitor: cleanTitulo,
          zonaEleitoral,
          secaoEleitoral,
          bairro,
          whatsapp: cleanPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao registrar assinatura.");
      }

      setSigned(true);
      setCurrentTotal((prev) => prev + 1);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao computar assinatura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="iniciativa-popular" className="stack paper-blue scroll-mt-16 overflow-hidden text-paper">
      {/* Colagem de fundo: xilogravura apagada, a estátua do Horto tingida de azul e o algodão do brasão */}
      <InkImage
        src="/collage/xilogravura-ink.webp"
        color="rgba(242, 193, 46, 0.13)"
        className="pointer-events-none absolute -left-32 -top-24 -z-10 h-[560px] w-[560px] rotate-[-10deg]"
      />
      <img
        src="/collage/estatua-horto-ht.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-8 right-[-3%] -z-10 hidden w-[340px] opacity-90 mix-blend-luminosity lg:block xl:w-[400px]"
      />
      <img
        src="/collage/algodao.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-[52%] -z-10 hidden w-[120px] rotate-[-14deg] lg:block"
      />

      <div className="page section-y relative">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-14">
          {/* Coluna Esquerda: Texto e Termômetro */}
          <div className="lg:col-span-7">
            <p className="font-type text-[14px] font-bold uppercase text-ink">
              <span className="tag-hl">Projeto de Lei de Iniciativa Popular • Lei Orgânica</span>
            </p>

            <h2 className="mt-5" data-reveal>
              <span className="relative inline-block">
                <span className="h-section block text-yellow">Projeto Trava-Salário:</span>
                <PenUnderline className="absolute -bottom-3 left-0 h-4 w-[92%]" color="var(--color-paper)" />
              </span>
              <span className="mt-7 block font-type text-[clamp(24px,2.8vw,36px)] font-bold leading-[1.25] text-ink">
                <span className="marker">Vereador não pode aumentar o próprio salário</span>
              </span>
            </h2>

            <p className="mt-6 max-w-[58ch] font-type text-[17px] leading-[1.65] text-paper">
              Pela Constituição Federal e Lei Orgânica de Juazeiro do Norte, os cidadãos podem apresentar projetos de lei com{" "}
              <strong className="marker text-ink">5.000 assinaturas de eleitores (1% do eleitorado)</strong>. Nossa proposta
              proíbe qualquer aumento de remuneração de vereadores acima da inflação oficial e sem plebiscito prévio.
            </p>

            {/* Termômetro de assinaturas */}
            <div className="mt-10 border-t-[3px] border-paper/80 pt-6" data-reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <span className="inline-block bg-paper px-2.5 py-1 font-type text-[15px] font-bold text-ink">
                    Termômetro de Assinaturas
                  </span>
                  <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
                    <span className="bg-yellow px-2 font-display text-[clamp(48px,5.4vw,84px)] leading-[1] text-ink">
                      {currentTotal.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-[18px] font-bold">de {targetCount.toLocaleString("pt-BR")} eleitores</span>
                  </div>
                </div>
                <div className="relative border-l-2 border-paper/30 pl-6 text-right">
                  <span className="font-display text-[clamp(48px,5.4vw,84px)] leading-[1] text-yellow">{percentage}%</span>
                  <p className="text-[15px]">da meta legal</p>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="relative mt-6">
                <Progress value={percentage} aria-label={`${percentage}% da meta legal`} />
                <div className="pointer-events-none absolute inset-0 flex justify-between px-[2px]">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <span key={i} className={`w-px self-end bg-ink ${i % 2 === 0 ? "h-full" : "h-1/2"} opacity-30`} />
                  ))}
                </div>
              </div>
              <div className="tabular mt-2 flex justify-between text-[13px] font-semibold text-paper/90">
                {[0, 1000, 2000, 3000, 4000, 5000].map((n) => (
                  <span key={n}>{n.toLocaleString("pt-BR")}</span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
                <span className="bg-white/10 px-2 py-1 font-type font-bold">
                  Faltam {Math.max(0, targetCount - currentTotal).toLocaleString("pt-BR")} assinaturas
                </span>
                <span className="flex items-center gap-2">
                  <PenArrow className="hidden h-7 w-14 sm:block" color="var(--color-yellow)" />
                  <span className="tag-hl font-bold">Etapa 1: Protocolo na Mesa Diretora</span>
                </span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Assinatura Cívica — abaixo-assinado */}
          <div className="lg:col-span-5" data-reveal style={{ ["--d" as string]: "150ms" }}>
            <div className="relative rotate-[-1deg] drop-shadow-[0_6px_10px_rgba(21,19,17,0.2)]">
              <div className="tape -top-3 left-1/2 z-10 -translate-x-1/2 rotate-[-3deg]" />
            <div className="relative bg-sheet p-6 text-ink sm:p-8" style={{ clipPath: tornClip(65, "trbl", 6, 36) }}>
              
              {signed ? (
                <div className="py-8 text-center">
                  <div className="stamp mx-auto mb-5 rotate-[-4deg] text-red">
                    Validado
                  </div>
                  <h3 className="font-display text-[28px] text-ink sm:text-[34px]">Assinatura Confirmada!</h3>
                  <p className="mt-3 text-[17px] leading-snug text-ink-2">
                    Seu título eleitoral foi validado e contabilizado no projeto de lei popular de Juazeiro do Norte.
                  </p>
                  <div className="mt-5 border-t border-dashed border-ink pt-4 text-[15px] text-ink-2">
                    Enviamos a confirmação protocolar com o resumo do projeto para seu WhatsApp.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 border-b-2 border-ink pb-4">
                    <div>
                      <h3 className="relative font-display text-[30px] leading-[0.95] text-ink sm:text-[36px]">
                        Assine Digitalmente o Projeto
                      </h3>
                    </div>
                  </div>
                  <p className="mt-3 text-[15px] leading-snug text-ink-2">
                    Dados eleitorais oficiais exigidos pelo Tribunal Regional Eleitoral (TRE-CE) para validação de iniciativa popular.
                  </p>

                  {errorMsg && (
                    <div className="mt-4 flex items-center gap-2 rounded-sm border-2 border-red bg-red/10 p-3 text-[14px] font-medium text-red-deep">
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <Label className="grid gap-2">
                      <span>Nome Completo (como no Título)</span>
                      <Input
                        type="text"
                        required
                        placeholder="Ex: Cícero da Silva Santos"
                        value={nomeCompleto}
                        onChange={(e) => setNomeCompleto(e.target.value)}
                      />
                    </Label>

                    <Label className="grid gap-2">
                      <span>Número do Título de Eleitor</span>
                      <Input
                        type="text"
                        required
                        inputMode="numeric"
                        placeholder="0000 0000 0000"
                        value={tituloEleitor}
                        onChange={handleTituloChange}
                        className="tabular"
                      />
                    </Label>

                    <div className="grid grid-cols-2 gap-4">
                      <Label className="grid gap-2">
                        <span>Zona Eleitoral</span>
                        <Select value={zonaEleitoral} onValueChange={setZonaEleitoral}>
                          <SelectTrigger className="w-full" aria-label="Zona Eleitoral">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="028">Zona 28 (Juazeiro)</SelectItem>
                            <SelectItem value="119">Zona 119 (Juazeiro)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Label>

                      <Label className="grid gap-2">
                        <span>Seção Eleitoral</span>
                        <Input
                          type="text"
                          required
                          placeholder="Ex: 0142"
                          value={secaoEleitoral}
                          onChange={(e) => setSecaoEleitoral(e.target.value)}
                        />
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Label className="grid gap-2">
                        <span>Bairro</span>
                        <Input
                          type="text"
                          required
                          placeholder="Ex: Pirajá"
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                        />
                      </Label>

                      <Label className="grid gap-2">
                        <span>WhatsApp</span>
                        <Input
                          type="text"
                          required
                          inputMode="tel"
                          placeholder="(88) 99999-9999"
                          value={whatsapp}
                          onChange={handlePhoneChange}
                        />
                      </Label>
                    </div>

                    <div className="flex items-start gap-2 pt-1 text-[14px] leading-snug text-ink-2">
                      <span>Declaro ser eleitor em Juazeiro do Norte e autorizo a inclusão do meu nome na petição popular.</span>
                    </div>

<div className="rounded-[14px] outline-offset-4 outline-blue has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex min-h-[58px] w-full cursor-pointer items-center justify-center gap-3 bg-red font-display text-[22px] text-white rounded-[12px] shadow-[inset_0_-3px_0_rgba(0,0,0,0.22),0_4px_10px_-2px_rgba(21,19,17,0.28)] transition-[background-color,color,transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.22),0_1px_3px_rgba(21,19,17,0.2)] hover:bg-red-deep focus-visible:outline-none disabled:opacity-60"
                    >
                      {loading ? "Validando assinatura..." : "ASSINAR PROJETO DE LEI"}
                      <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" aria-hidden />
                    </button>
                    </div>
                  </form>
                </>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
