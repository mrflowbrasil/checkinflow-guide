// Renders a BRL amount with main integer part and smaller decimals.
// Example: R$ 1.234,56  → "1.234" big, ",56" small.
interface MoneyProps {
  value: number | null | undefined;
  className?: string;
  decimalClassName?: string;
  prefixClassName?: string;
  showPrefix?: boolean;
}

export function Money({
  value,
  className = "",
  decimalClassName = "text-[0.55em] font-medium text-muted-foreground ml-0.5 align-baseline",
  prefixClassName = "text-[0.55em] font-medium text-muted-foreground mr-1 align-baseline",
  showPrefix = true,
}: MoneyProps) {
  const v = Number(value ?? 0) || 0;
  const neg = v < 0;
  const abs = Math.abs(v);
  const fixed = abs.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const intFormatted = Number(intPart).toLocaleString("pt-BR");
  return (
    <span className={`tabular-nums ${className}`}>
      {showPrefix && <span className={prefixClassName}>R$</span>}
      {neg ? "−" : ""}
      {intFormatted}
      <span className={decimalClassName}>,{decPart}</span>
    </span>
  );
}
