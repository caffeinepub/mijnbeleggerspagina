import { TrendingDown, TrendingUp } from "lucide-react";
import type { MarketIndex } from "../hooks/useQueries";

type Props = {
  index: MarketIndex;
};

export default function MarketCard({ index }: Props) {
  const isPositive = index.changePercent >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {index.name}
        </span>
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            isPositive ? "text-positive" : "text-negative"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}
          {index.changePercent.toFixed(2)}%
        </span>
      </div>
      <div className="text-xl font-bold text-foreground">
        {index.symbol === "BTC-USD" ? "$" : ""}
        {index.price.toLocaleString("nl-NL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      <div className="text-xs text-muted-foreground">{index.symbol}</div>
    </div>
  );
}
