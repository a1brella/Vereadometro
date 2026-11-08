"use client";

import React, { useState, useEffect } from "react";
import { VereadorWithDetails } from "@/lib/types";
import { ModalShell } from "@/components/editorial/Editorial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <ModalShell onClose={onClose} label="Ative o alerta do seu vereador" className="max-w-xl">
      <div className="thin-scroll max-h-[92vh] overflow-y-auto">
        {success ? (
          <div className="p-6 text-center sm:p-9">
            <div className="stamp mx-auto mb-5 rotate-[-6deg] !text-[13px] text-leaf">
              Ativado
            </div>
            <h3 className="font-display text-[28px] leading-[1] text-ink">Inscrição Ativada com Sucesso!</h3>
            <p className="mt-3 text-[17px] text-ink-2">
              Obrigado, <strong className="font-semibold text-ink">{nome}</strong>! Enviamos a confirmação
              para o seu WhatsApp.
            </p>
            <div className="mt-6 rounded-sm bg-paper-2 p-4 text-left text-[15px] leading-[1.6] text-ink-2">
              <strong className="text-ink">Como funcionará seu extrato:</strong> Todo início de mês ou quando houver
              nomeação de assessores e votação de reajustes na Câmara de Juazeiro, você receberá um alerta escaneável no seu
              WhatsApp.
            </div>
            <Button onClick={onClose} variant="ink" size="lg" className="mt-7 w-full">
              Concluir &amp; Continuar Fiscalizando
            </Button>
          </div>
        ) : (
          <>
            {/* Cabeçalho tipo telegrama */}
            <div className="relative overflow-hidden bg-yellow px-6 pb-6 pt-5 sm:px-8">
              <img
                src="/collage/flor-mandacaru.webp"
                alt=""
                aria-hidden
                className="pointer-events-none absolute -bottom-10 -right-6 w-[140px] rotate-[14deg] opacity-95"
              />
              <div className="relative flex items-center gap-2 text-[14px] font-bold text-ink">
                <span>Extrato Mensal no WhatsApp</span>
              </div>
              <h2 className="relative mt-2 max-w-[80%] font-display text-[clamp(28px,5vw,40px)] leading-[0.95] text-ink">
                Ative o Alerta do Seu Vereador
              </h2>
              <p className="relative mt-3 max-w-[76%] text-[16px] leading-snug text-ink">
                Saiba exatamente quanto cada vereador custou e o que votou antes da eleição chegar. Gratuito e 100%
                independente.
              </p>
            </div>

            <div className="border-t-2 border-ink px-6 pb-7 pt-5 sm:px-8">
              {errorMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-sm border-2 border-red bg-red/10 p-3 text-[14px] font-medium text-red-deep">
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Label className="grid gap-2">
                  <span>Seu Nome</span>
                  <Input
                    type="text"
                    required
                    placeholder="Ex: Mariana Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </Label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Label className="grid gap-2">
                    <span>WhatsApp (com DDD)</span>
                    <Input
                      type="text"
                      required
                      inputMode="tel"
                      placeholder="(88) 99999-9999"
                      value={whatsapp}
                      onChange={handlePhoneChange}
                    />
                  </Label>

                  <Label className="grid gap-2">
                    <span>Bairro de Juazeiro</span>
                    <Select value={bairro} onValueChange={setBairro}>
                      <SelectTrigger className="w-full" aria-label="Bairro de Juazeiro">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BAIRROS_JUAZEIRO.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Label>
                </div>

                <Label className="grid gap-2">
                  <span>E-mail (Opcional)</span>
                  <Input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Label>

                {/* Seleção de Vereadores */}
                <div className="rounded-sm border-2 border-ink bg-paper-2 p-4">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <Input
                      type="checkbox"
                      checked={seguirTodos}
                      onChange={(e) => setSeguirTodos(e.target.checked)}
                      className="h-4 w-4 accent-[#e3352a]"
                    />
                    <span className="text-[15px] font-semibold text-ink">
                      Seguir Todos os 21 Vereadores de Juazeiro (Recomendado)
                    </span>
                  </label>

                  {!seguirTodos && (
                    <div className="thin-scroll mt-3 max-h-44 space-y-0.5 overflow-y-auto border-t border-ink/25 pt-2">
                      <p className="mb-1 text-[14px] text-ink-2">
                        Escolha os vereadores do seu bairro ou interesse:
                      </p>
                      {vereadores.map((v) => (
                        <label
                          key={v.id}
                          className="flex min-h-[40px] cursor-pointer items-center justify-between px-1.5 text-[15px] hover:bg-yellow/40"
                        >
                          <span className="font-medium text-ink">
                            {v.nomeParlamentar} ({v.partido})
                          </span>
                          <Input
                            type="checkbox"
                            checked={selectedIds.includes(v.id)}
                            onChange={() => toggleVereador(v.id)}
                            className="h-3.5 w-3.5 accent-[#e3352a]"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Opt-in e Segurança */}
                <div className="flex items-start gap-2 text-[14px] leading-snug text-ink-2">
                  <span>
                    Respeitamos sua privacidade. Seus dados nunca serão compartilhados com partidos ou terceiros e serão usados
                    apenas para alertas de fiscalização pública.
                  </span>
                </div>

                <Button type="submit" disabled={loading} size="lg" className="w-full">
                  {loading ? (
                    <span>Salvando inscrição...</span>
                  ) : (
                    <>
                      <span>ATIVAR MEU ALERTA NO ZAP</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
};
