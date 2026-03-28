import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useStockQuote } from "../hooks/useQueries";

type Props = {
  symbol: string;
  onRemove?: () => void;
  showRemove?: boolean;
};

export default function StockRow({ symbol, onRemove, showRemove }: Props) {
  const { data, isLoading } = useStockQuote(symbol);
  const isPositive = (data?.changePercent ?? 0) >= 0;

  return (
    <div className="flex items-center justify-between py-3 px-1 border-b border-border/50 last:border-0 group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-teal">
          {symbol.slice(0, 2)}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{symbol}</div>
          {data?.name && data.name !== symbol && (
            <div className="text-xs text-muted-foreground truncate max-w-[120px]">
              {data.name}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">
                {data?.currency === "USD" ? "$" : "€"}
                {data?.price.toFixed(2)}
              </div>
              <Badge
                variant="outline"
                className={`text-xs border-0 px-1.5 py-0 ${
                  isPositive
                    ? "bg-[oklch(0.76_0.14_162/0.15)] text-positive"
                    : "bg-[oklch(0.63_0.19_27/0.15)] text-negative"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 mr-0.5 inline" />
                )}
                {isPositive ? "+" : ""}
                {data?.changePercent.toFixed(2)}%
              </Badge>
            </div>
            {showRemove && onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-negative transition-opacity text-xs"
                data-ocid="watchlist.delete_button"
                aria-label={`Verwijder ${symbol}`}
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
