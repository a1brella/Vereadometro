"use client";

import React, { useEffect, useState } from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsIcon } from "@/components/editorial/Editorial";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  onOpenLeadModal: (vereadorId?: string) => void;
  search: string;
  onSearch: (value: string) => void;
}

/** Seções navegáveis, na ordem da página. Só aparecem as que existem no documento. */
const SECTIONS = [
  { id: "ranking-section", label: "Ranking de Gastos" },
  { id: "iniciativa-popular", label: "Projeto Trava-Salário" },
  { id: "tribuna", label: "Tribuna" },
  { id: "fontes", label: "Fontes" },
];

/** Marca: a bandeira de Juazeiro do Norte reduzida a um selo. */
export function FlagMark({ className = "h-10 w-10" }: { className?: string }) {
  // Selo do "-ômetro": um medidor com o ponteiro entrando na zona vermelha,
  // sobre o amarelo e o azul da bandeira de Juazeiro.
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="7" fill="#f2c12e" />
      <path d="M0 31h40v2a7 7 0 0 1-7 7H7a7 7 0 0 1-7-7z" fill="#1d3fa8" />
      <path d="M7.5 26a12.5 12.5 0 0 1 25 0" fill="none" stroke="#151311" strokeWidth="4" />
      <path d="M28.84 17.16A12.5 12.5 0 0 1 32.5 26" fill="none" stroke="#c8221a" strokeWidth="4" />
      <path d="M20 9.5v2.6M11.2 13.2l1.8 1.8M8.4 21.4l2.5.7" stroke="#151311" strokeWidth="1.6" />
      <path d="M20 26L29.5 15.5" stroke="#151311" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="26" r="3.2" fill="#151311" />
    </svg>
  );
}

/** Acompanha qual seção está no meio da tela. */
function useActiveSection() {
  const [items, setItems] = useState(SECTIONS);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const present = SECTIONS.filter((s) => document.getElementById(s.id));
    setItems(present);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    present.forEach((s) => io.observe(document.getElementById(s.id)!));
    // Antes da primeira seção (hero, extrato) nenhum item fica marcado
    const first = present[0] && document.getElementById(present[0].id);
    const onScroll = () => {
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.5) setActive(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return { items, active };
}

/** Links das seções; a seção atual fica em amarelo. */
function SectionLinks({ items, active }: { items: typeof SECTIONS; active: string | null }) {
  return (
    <nav aria-label="Seções" className="hidden lg:block">
      <ul className="flex items-center gap-7">
        {items.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className="flex h-16 items-center text-[15px] font-semibold text-paper/75 transition-colors duration-200 hover:text-paper aria-[current=location]:text-yellow"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Busca do cabeçalho: filtra o ranking enquanto digita; Enter leva até a lista. */
function HeaderSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <form
      role="search"
      className="relative hidden w-full max-w-[340px] xl:block"
      onSubmit={(e) => {
        e.preventDefault();
        document.getElementById("ranking-section")?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-paper/70" aria-hidden />
      <input
        type="search"
        aria-label="Buscar vereador ou partido"
        placeholder="Buscar vereador ou partido..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-full border border-paper/25 bg-white/5 pl-10 pr-4 text-[14px] text-paper outline-none transition-[border-color,background-color] placeholder:text-paper/55 focus:border-paper/60 focus:bg-white/10"
      />
    </form>
  );
}

export const Header: React.FC<HeaderProps> = ({ onOpenLeadModal, search, onSearch }) => {
  const { items, active } = useActiveSection();

  return (
    <header className="sticky top-0 z-40 w-full bg-ink text-paper">
      <div className="page flex h-16 items-center justify-between gap-6">
        {/* Marca */}
        <a href="#" className="group flex shrink-0 items-center gap-2.5" aria-label="Vereadômetro Juazeiro — início">
          <FlagMark className="size-7 shrink-0 -rotate-3 sm:size-8 transition-transform duration-300 group-hover:rotate-3" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[19px] tracking-[0.02em] sm:text-[21px]">Vereadômetro</span>
            <span className="mt-0.5 hidden font-type text-[9px] font-bold uppercase tracking-[0.2em] text-yellow sm:block">
              Juazeiro do Norte
            </span>
          </span>
        </a>

        <SectionLinks items={items} active={active} />

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 lg:flex-none xl:flex-1">
          <HeaderSearch value={search} onChange={onSearch} />

          {/* Ação principal */}
          <Button
            variant="whatsapp"
            onClick={() => onOpenLeadModal()}
            className="h-10 shrink-0 gap-2 px-3 text-[13px] sm:px-4 sm:text-[14px]"
          >
            <WhatsIcon className="size-[18px]" />
            Alerta no Zap
          </Button>

          {/* Menu (celular e tablet) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="size-10 shrink-0 border-paper/30 text-paper hover:bg-paper hover:text-ink lg:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm border-l-0 bg-paper p-0">
              <SheetHeader className="border-b border-ink/15 p-5">
                <SheetTitle>VEREADÔMETRO</SheetTitle>
                <SheetDescription className="text-[15px] text-ink-2">
                  Transparência Cívica &amp; Fiscalização da Câmara Municipal
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Seções" className="p-5">
                <ul>
                  {items.map((s) => (
                    <li key={s.id}>
                      <SheetClose asChild>
                        <a
                          href={`#${s.id}`}
                          aria-current={active === s.id ? "location" : undefined}
                          className="flex min-h-14 items-center justify-between border-b border-ink/20 text-[20px] font-extrabold text-ink [font-stretch:115%] aria-[current=location]:text-red"
                        >
                          {s.label}
                          <span aria-hidden className="text-[18px]">→</span>
                        </a>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
                <SheetClose asChild>
                  <Button variant="whatsapp" size="lg" className="mt-8 w-full" onClick={() => onOpenLeadModal()}>
                    <WhatsIcon className="size-5" />
                    Alerta no Zap
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
