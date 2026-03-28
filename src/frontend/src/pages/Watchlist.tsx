import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Star, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import LoginPrompt from "../components/LoginPrompt";
import StockRow from "../components/StockRow";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useWatchlist,
} from "../hooks/useQueries";

const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "NVDA",
  "META",
  "ASML",
  "RDSA",
  "PHIA",
];

export default function Watchlist() {
  const { identity } = useInternetIdentity();
  const { data: watchlist, isLoading } = useWatchlist();
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  if (!identity) {
    return (
      <LoginPrompt message="Log in om je persoonlijke watchlist te beheren." />
    );
  }

  const handleAdd = async () => {
    const symbol = input.trim().toUpperCase();
    if (!symbol) return;
    if (watchlist?.includes(symbol)) {
      toast.error(`${symbol} staat al in je watchlist`);
      return;
    }
    try {
      await addMutation.mutateAsync(symbol);
      toast.success(`${symbol} toegevoegd aan watchlist`);
      setInput("");
    } catch {
      toast.error("Kon aandeel niet toevoegen");
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      await removeMutation.mutateAsync(symbol);
      toast.success(`${symbol} verwijderd uit watchlist`);
    } catch {
      toast.error("Kon aandeel niet verwijderen");
    }
  };

  const handleClearAll = async () => {
    if (
      !watchlist ||
      !confirm("Weet je zeker dat je alle aandelen wilt verwijderen?")
    )
      return;
    try {
      for (const s of watchlist) {
        await removeMutation.mutateAsync(s);
      }
      toast.success("Watchlist leeggemaakt");
    } catch {
      toast.error("Fout bij leeghalen watchlist");
    }
  };

  const filtered =
    watchlist?.filter((s) => s.toLowerCase().includes(search.toLowerCase())) ??
    [];

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Beheer de aandelen die je wilt volgen
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="text-sm font-semibold">Aandeel toevoegen</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Bijv. AAPL, TSLA, ASML..."
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                data-ocid="watchlist.input"
              />
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending || !input.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                data-ocid="watchlist.primary_button"
              >
                {addMutation.isPending ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Toevoegen
                  </>
                )}
              </Button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Populair:</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_STOCKS.filter((s) => !watchlist?.includes(s))
                  .slice(0, 8)
                  .map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-teal" />
                Gevolgde Aandelen
                <span className="text-muted-foreground font-normal">
                  ({filtered.length})
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Zoeken..."
                  className="pl-8 h-8 text-xs w-40 bg-muted border-border"
                  data-ocid="watchlist.search_input"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-2" data-ocid="watchlist.loading_state">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="watchlist.empty_state"
              >
                <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search
                    ? "Geen resultaten gevonden"
                    : "Je watchlist is leeg. Voeg aandelen toe om te beginnen!"}
                </p>
              </div>
            ) : (
              <div>
                {filtered.map((symbol, i) => (
                  <motion.div
                    key={symbol}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`watchlist.item.${i + 1}`}
                  >
                    <StockRow
                      symbol={symbol}
                      showRemove
                      onRemove={() => handleRemove(symbol)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {watchlist && watchlist.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-negative border-negative/30 hover:bg-negative/10 hover:text-negative"
            onClick={handleClearAll}
            data-ocid="watchlist.delete_button"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Alles verwijderen
          </Button>
        </div>
      )}
    </div>
  );
}
