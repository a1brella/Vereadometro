import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/* Botões do Vereadômetro: retangulares, tinta chapada, alvo de toque ≥ 44px. */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 font-bold whitespace-nowrap shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)] transition-[background-color,color,border-color,transform,box-shadow] duration-150 ease-out outline-none hover:-translate-y-px active:translate-y-px active:shadow-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:border-red-deep hover:bg-red-deep",
        ink: "border-secondary bg-secondary text-secondary-foreground hover:border-blue hover:bg-blue",
        outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
        paper: "border-paper bg-paper text-ink hover:bg-yellow hover:border-yellow",
        ghost: "border-transparent shadow-none text-ink hover:bg-ink/8",
        /* Verde do WhatsApp, um tom mais escuro para o texto branco manter 4.5:1 */
        whatsapp: "border-[#128c4a] bg-[#128c4a] text-white hover:border-[#0d6e3a] hover:bg-[#0d6e3a]",
        link: "border-transparent shadow-none hover:translate-y-0 px-0 text-ink underline decoration-2 underline-offset-[6px] hover:decoration-red",
      },
      size: {
        default: "h-11 px-5 text-[15px]",
        sm: "h-9 px-3 text-[14px]",
        lg: "h-[54px] px-7 text-[16px]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
