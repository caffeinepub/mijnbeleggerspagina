import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Newspaper, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import NewsCard from "../components/NewsCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useFinancialNews, useWatchlist } from "../hooks/useQueries";

const DEFAULT_SYMBOLS = ["AAPL", "TSLA", "MSFT"];

function NewsSection({ symbol }: { symbol: string }) {
  const { data: news, isLoading, error } = useFinancialNews(symbol);
  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-teal" />
          Nieuws: {symbol}
          {news && (
            <Badge className="bg-muted text-muted-foreground border-0 text-xs">
              {news.length} artikelen
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3" data-ocid="news.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : error ? (
          <p
            className="text-sm text-negative py-4 text-center"
            data-ocid="news.error_state"
          >
            Kon nieuws niet laden
          </p>
        ) : news && news.length > 0 ? (
          <div>
            {news.map((item, i) => (
              <NewsCard key={item.title || i} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6" data-ocid="news.empty_state">
            <p className="text-sm text-muted-foreground">
              Geen nieuws beschikbaar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Nieuws() {
  const { identity } = useInternetIdentity();
  const { data: watchlist } = useWatchlist();
  const qc = useQueryClient();

  const symbols =
    watchlist && watchlist.length > 0 ? watchlist.slice(0, 5) : DEFAULT_SYMBOLS;
  const [activeSymbol, setActiveSymbol] = useState(symbols[0] ?? "AAPL");

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ["news"] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Financieel Nieuws
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {identity
              ? "Nieuws van je gevolgde aandelen"
              : "Nieuws van populaire aandelen"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal transition-colors"
          data-ocid="nieuws.secondary_button"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Vernieuwen
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex gap-2 flex-wrap"
      >
        {symbols.map((sym) => (
          <button
            type="button"
            key={sym}
            onClick={() => setActiveSymbol(sym)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeSymbol === sym
                ? "bg-primary text-primary-foreground shadow-teal-glow"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
            data-ocid="nieuws.tab"
          >
            {sym}
          </button>
        ))}
      </motion.div>

      <motion.div
        key={activeSymbol}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <NewsSection symbol={activeSymbol} />
      </motion.div>
    </div>
  );
}
