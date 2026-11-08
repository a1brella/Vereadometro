import React, { useState, useEffect } from "react";
import { X, BellRing, Check, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { VereadorWithDetails } from "@/lib/types";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  vereadores: VereadorWithDetails[];
  initialSelectedVereadorId?: string;
}

const BAIRROS_JUAZEIRO = [
  "Centro",
  "Triângulo",
  "Lagoa Seca",
  "Pirajá",
  "João Cabral",
  "Pio XII",
  "Franciscanos",
  "Romeirão",
  "Novo Juazeiro",
  "Frei Damião",
  "Horto",
  "Limoeiro",
  "Planalto",
  "Tiradentes",
  "São José",
  "Betolândia",
  "Timbaúbas",
  "Campo Alegre",
  "Aeroporto",
  "Vila Fátima",
  "Marrocos (Zona Rural)",
  "Carás do Umari (Zona Rural)",
];

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  vereadores,
  initialSelectedVereadorId,
}) => {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bairro, setBairro] = useState("Centro");
  const [email, setEmail] = useState("");
  const [seguirTodos, setSeguirTodos] = useState(!initialSelectedVereadorId);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedVereadorId ? [initialSelectedVereadorId] : []
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialSelectedVereadorId) {
      setSeguirTodos(false);
      setSelectedIds([initialSelectedVereadorId]);
    } else {
      setSeguirTodos(true);
      setSelectedIds([]);
    }
    setErrorMsg("");
    setSuccess(false);
  }, [initialSelectedVereadorId, isOpen]);

  if (!isOpen) return null;

  // Formatador simples para telefone BR: (88) 99999-9999
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 11) {
      let formatted = raw;
      if (raw.length > 2) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
      }
      if (raw.length > 7) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
      }
      setWhatsapp(formatted);
    }
  };

  const toggleVereador = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanDigits = whatsapp.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setErrorMsg("Por favor, digite um número de WhatsApp válido com DDD (ex: 88).");
      return;
    }

    if (!seguirTodos && selectedIds.length === 0) {
      setErrorMsg("Selecione ao menos um vereador para acompanhar ou marque 'Seguir Todos'.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          whatsapp: cleanDigits,
          ddd: cleanDigits.slice(0, 2),
          bairro,
          email: email.trim() || undefined,
          seguirTodos,
          vereadoresIds: seguirTodos ? [] : selectedIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao registrar inscrição.");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-4 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-white">
              Inscrição Ativada com Sucesso!
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Obrigado, <strong className="text-emerald-400">{nome}</strong>! Enviamos a confirmação para o seu WhatsApp.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-400 text-left">
              📱 <strong>Como funcionará seu extrato:</strong> Todo início de mês ou quando houver nomeação de assessores e votação de reajustes na Câmara de Juazeiro, você receberá um alerta escaneável no seu WhatsApp.
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              Concluir & Continuar Fiscalizando
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Extrato Mensal no WhatsApp</span>
            </div>

            <h2 className="text-2xl font-black text-white">
              Ative o Alerta do Seu Vereador
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Saiba exatamente quanto cada vereador custou e o que votou antes da eleição chegar. Gratuito e 100% independente.
            </p>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-700/60 p-3 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    WhatsApp (com DDD)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(88) 99999-9999"
                    value={whatsapp}
                    onChange={handlePhoneChange}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Bairro de Juazeiro
                  </label>
                  <select
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {BAIRROS_JUAZEIRO.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  E-mail (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Seleção de Vereadores */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seguirTodos}
                    onChange={(e) => setSeguirTodos(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                  <span className="text-xs font-bold text-white">
                    Seguir Todos os 21 Vereadores de Juazeiro (Recomendado)
                  </span>
                </label>

                {!seguirTodos && (
                  <div className="mt-3 max-h-36 overflow-y-auto space-y-1.5 border-t border-slate-800 pt-2">
                    <p className="text-[11px] text-slate-400 mb-1">
                      Escolha os vereadores do seu bairro ou interesse:
                    </p>
                    {vereadores.map((v) => (
                      <label
                        key={v.id}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-xs"
                      >
                        <span className="text-slate-300 font-medium">
                          {v.nomeParlamentar} ({v.partido})
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(v.id)}
                          onChange={() => toggleVereador(v.id)}
                          className="h-3.5 w-3.5 rounded accent-emerald-500"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Opt-in e Segurança */}
              <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  Respeitamos sua privacidade. Seus dados nunca serão compartilhados com partidos ou terceiros e serão usados apenas para alertas de fiscalização pública.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-600/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition"
              >
                {loading ? (
                  <span>Salvando inscrição...</span>
                ) : (
                  <>
                    <BellRing className="w-4 h-4 fill-slate-950" />
                    <span>ATIVAR MEU ALERTA NO ZAP</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
