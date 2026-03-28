import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, Eye, Newspaper, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import MarketCard from "../components/MarketCard";
import NewsCard from "../components/NewsCard";
import StockRow from "../components/StockRow";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFinancialNews,
  useMarketSummary,
  useStockQuote,
  useWatchlist,
} from "../hooks/useQueries";

const DEMO_INDICES = [
  { symbol: "^GSPC", name: "S&P 500", price: 5287.76, changePercent: 0.82 },
  { symbol: "^IXIC", name: "NASDAQ", price: 16832.92, changePercent: 1.24 },
  { symbol: "^DJI", name: "Dow Jones", price: 39169.52, changePercent: 0.38 },
  { symbol: "BTC-USD", name: "Bitcoin", price: 68432.1, changePercent: -1.14 },
];

const DEMO_NEWS = [
  {
    title: "Fed behoudt rente op huidig niveau, markt reageert positief",
    publisher: "Reuters",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    title: "Apple overtreft winstverwachtingen in Q4 rapport",
    publisher: "Bloomberg",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    title: "Tesla kondigt nieuwe gigafactory aan in Europa",
    publisher: "CNBC",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 10800,
  },
  {
    title: "Olieprijzen stijgen na OPEC beslissing",
    publisher: "FT",
    link: "#",
    providerPublishTime: Math.floor(Date.now() / 1000) - 14400,
  },
];

function WatchlistSummaryCard({ symbol }: { symbol: string }) {
  const { data, isLoading } = useStockQuote(symbol);
  const isPositive = (data?.changePercent ?? 0) >= 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold text-teal">
          {symbol.slice(0, 2)}
        </div>
        <span className="text-sm font-medium text-foreground">{symbol}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-4 w-20" />
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            ${data?.price.toFixed(2)}
          </span>
          <Badge
            variant="outline"
            className={`text-[11px] px-1.5 py-0 border-0 ${
              isPositive
                ? "bg-[oklch(0.76_0.14_162/0.15)] text-positive"
                : "bg-[oklch(0.63_0.19_27/0.15)] text-negative"
            }`}
          >
            {isPositive ? "+" : ""}
            {data?.changePercent.toFixed(2)}%
          </Badge>
        </div>
      )}
    </div>
  );
}

type Props = { onNavigate: (page: string) => void };

export default function Dashboard({ onNavigate }: Props) {
  const { identity } = useInternetIdentity();
  const { data: watchlist, isLoading: wlLoading } = useWatchlist();
  const { data: marketData, isLoading: marketLoading } = useMarketSummary();
  const { data: news, isLoading: newsLoading } = useFinancialNews(
    watchlist?.[0] ?? "AAPL",
    !!watchlist?.[0],
  );

  const isLoggedIn = !!identity;
  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const displayMarket =
    marketData && marketData.length > 0 ? marketData : DEMO_INDICES;
  const displayNews = news && news.length > 0 ? news : DEMO_NEWS;

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welkom terug{isLoggedIn ? ", Belegger" : ""}! 👋
          </h1>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          Live data
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        data-ocid="dashboard.section"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Marktoverzicht
        </h2>
        {marketLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {displayMarket.map((idx) => (
              <MarketCard key={idx.symbol} index={idx} />
            ))}
          </div>
        )}
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="bg-card border-border shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-teal" />
                Mijn Watchlist
                {watchlist && (
                  <Badge className="ml-auto bg-primary/20 text-teal border-0 text-xs">
                    {watchlist.length} aandelen
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!isLoggedIn ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">
                    Log in om je watchlist te zien
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate("watchlist")}
                    className="text-sm text-teal hover:underline"
                    data-ocid="dashboard.link"
                  >
                    Naar watchlist →
                  </button>
                </div>
              ) : wlLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : watchlist && watchlist.length > 0 ? (
                <div>
                  {watchlist.slice(0, 5).map((sym) => (
                    <WatchlistSummaryCard key={sym} symbol={sym} />
                  ))}
                  {watchlist.length > 5 && (
                    <button
                      type="button"
                      onClick={() => onNavigate("watchlist")}
                      className="mt-3 text-xs text-teal hover:underline w-full text-center"
                      data-ocid="dashboard.secondary_button"
                    >
                      +{watchlist.length - 5} meer bekijken
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="text-center py-8"
                  data-ocid="watchlist.empty_state"
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    Nog geen aandelen gevolgd
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate("watchlist")}
                    className="text-sm text-teal hover:underline"
                    data-ocid="dashboard.link"
                  >
                    Aandelen toevoegen →
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card border-border shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-teal" />
                Laatste Financieel Nieuws
                {watchlist?.[0] && (
                  <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                    {watchlist[0]}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {newsLoading ? (
                <div className="space-y-3" data-ocid="news.loading_state">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : displayNews.length > 0 ? (
                <div>
                  {displayNews.map((item) => (
                    <NewsCard
                      key={item.title}
                      item={item}
                      index={displayNews.indexOf(item)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => onNavigate("nieuws")}
                    className="mt-3 text-xs text-teal hover:underline w-full text-center"
                    data-ocid="dashboard.link"
                  >
                    Meer nieuws bekijken →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8" data-ocid="news.empty_state">
                  <p className="text-sm text-muted-foreground">
                    Geen nieuws gevonden
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          type="button"
          onClick={() => onNavigate("watchlist")}
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all text-left"
          data-ocid="dashboard.primary_button"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Eye className="h-5 w-5 text-teal" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Watchlist beheren
            </div>
            <div className="text-xs text-muted-foreground">
              Aandelen toevoegen of verwijderen
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("inzichten")}
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all text-left"
          data-ocid="dashboard.secondary_button"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-teal" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Inzichten schrijven
            </div>
            <div className="text-xs text-muted-foreground">
              Publiceer je beleggersanalyse
            </div>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
