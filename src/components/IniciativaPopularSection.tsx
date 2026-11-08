import React, { useState } from "react";
import { FileSignature, ShieldCheck, CheckCircle2, AlertCircle, Users, Scale } from "lucide-react";

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
    <section id="iniciativa-popular" className="py-12 px-4 sm:px-6 relative">
      <div className="mx-auto max-w-7xl">
        {/* Card Principal da Iniciativa */}
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decoração sutil */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Coluna Esquerda: Texto e Termômetro */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-400 mb-4">
                <Scale className="w-3.5 h-3.5" />
                <span>PROJETO DE LEI DE INICIATIVA POPULAR • LEI ORGÂNICA</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                PROJETO TRAVA-SALÁRIO:{" "}
                <span className="text-emerald-400">
                  Vereador não pode aumentar o próprio salário
                </span>
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-300">
                Pela Constituição Federal e Lei Orgânica de Juazeiro do Norte, os cidadãos podem apresentar projetos de lei com <strong>5.000 assinaturas de eleitores (1% do eleitorado)</strong>. Nossa proposta proíbe qualquer aumento de remuneração de vereadores acima da inflação oficial e sem plebiscito prévio.
              </p>

              {/* Termômetro Visual de Assinaturas */}
              <div className="mt-6 rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Termômetro de Assinaturas
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                      {currentTotal.toLocaleString("pt-BR")}{" "}
                      <span className="text-sm font-normal text-slate-400">
                        de {targetCount.toLocaleString("pt-BR")} eleitores
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">
                      {percentage}%
                    </span>
                    <p className="text-[11px] text-slate-400">da meta legal</p>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mt-3 h-4 w-full rounded-full bg-slate-800 p-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 shadow-lg shadow-emerald-500/50 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Faltam {Math.max(0, targetCount - currentTotal).toLocaleString("pt-BR")} assinaturas
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    Etapa 1: Protocolo na Mesa Diretora
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Formulário de Assinatura Cívica */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/90 p-5 sm:p-6 shadow-xl backdrop-blur">
                {signed ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-3">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Assinatura Confirmada!
                    </h3>
                    <p className="mt-2 text-xs text-slate-300">
                      Seu título eleitoral foi validado e contabilizado no projeto de lei popular de Juazeiro do Norte.
                    </p>
                    <div className="mt-4 rounded-xl bg-slate-900 p-3 text-xs text-slate-400">
                      Enviamos a confirmação protocolar com o resumo do projeto para seu WhatsApp.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <FileSignature className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-bold text-white">
                        Assine Digitalmente o Projeto
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Dados eleitorais oficiais exigidos pelo Tribunal Regional Eleitoral (TRE-CE) para validação de iniciativa popular.
                    </p>

                    {errorMsg && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-700/60 p-2.5 text-xs text-red-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                          Nome Completo (como no Título)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Cícero da Silva Santos"
                          value={nomeCompleto}
                          onChange={(e) => setNomeCompleto(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                          Número do Título de Eleitor
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="0000 0000 0000"
                          value={tituloEleitor}
                          onChange={handleTituloChange}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                            Zona Eleitoral
                          </label>
                          <select
                            value={zonaEleitoral}
                            onChange={(e) => setZonaEleitoral(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="028">Zona 28 (Juazeiro)</option>
                            <option value="119">Zona 119 (Juazeiro)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                            Seção Eleitoral
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: 0142"
                            value={secaoEleitoral}
                            onChange={(e) => setSecaoEleitoral(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                            Bairro
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Pirajá"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                            WhatsApp
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="(88) 99999-9999"
                            value={whatsapp}
                            onChange={handlePhoneChange}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 pt-1 text-[10px] text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                        <span>
                          Declaro ser eleitor em Juazeiro do Norte e autorizo a inclusão do meu nome na petição popular.
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition"
                      >
                        {loading ? "Validando assinatura..." : "✍️ ASSINAR PROJETO DE LEI"}
                      </button>
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
