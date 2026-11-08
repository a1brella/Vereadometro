/**
 * Utilitários de formatação determinística.
 * Evita discrepâncias de hidratação (SSR vs Client) causadas por diferenças
 * de Intl / toLocaleString entre ambientes de servidor (Node.js) e navegadores (iOS/Android/Windows).
 */

export function formatCurrency(val: number): string {
  if (typeof val !== "number" || isNaN(val)) return "R$ 0";
  const formatted = Math.round(val)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${formatted}`;
}

export function formatNumber(val: number): string {
  if (typeof val !== "number" || isNaN(val)) return "0";
  return Math.round(val)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
