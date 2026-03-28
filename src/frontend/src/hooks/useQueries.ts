import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Article } from "../backend.d";
import { useActor } from "./useActor";

export type StockQuote = {
  symbol: string;
  price: number;
  changePercent: number;
  currency: string;
  name: string;
};

export type MarketIndex = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
};

export type NewsItem = {
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  thumbnail?: string;
};

function parseStockQuote(json: string, symbol: string): StockQuote {
  try {
    const data = JSON.parse(json);
    const meta = data?.chart?.result?.[0]?.meta;
    return {
      symbol,
      price: meta?.regularMarketPrice ?? 0,
      changePercent: meta?.regularMarketChangePercent ?? 0,
      currency: meta?.currency ?? "USD",
      name: meta?.longName ?? meta?.shortName ?? symbol,
    };
  } catch {
    return {
      symbol,
      price: 0,
      changePercent: 0,
      currency: "USD",
      name: symbol,
    };
  }
}

function parseNews(json: string): NewsItem[] {
  try {
    const data = JSON.parse(json);
    const items = data?.news ?? data?.data?.news ?? [];
    return items.slice(0, 6).map((n: Record<string, unknown>) => ({
      title: String(n.title ?? ""),
      publisher: String(n.publisher ?? ""),
      link: String(n.link ?? "#"),
      providerPublishTime: Number(n.providerPublishTime ?? 0),
      thumbnail: (n.thumbnail as Record<string, unknown>)?.resolutions
        ? String(
            (
              (n.thumbnail as Record<string, unknown>)?.resolutions as unknown[]
            )?.[0] ?? "",
          )
        : undefined,
    }));
  } catch {
    return [];
  }
}

function parseMarketSummary(json: string): MarketIndex[] {
  try {
    const data = JSON.parse(json);
    // Could be single or array chart result
    const results = data?.chart?.result ?? [];
    const symbolNames: Record<string, string> = {
      "^GSPC": "S&P 500",
      "^IXIC": "NASDAQ",
      "^DJI": "Dow Jones",
      "BTC-USD": "Bitcoin",
    };
    if (results.length > 0) {
      const meta = results[0].meta;
      const sym = meta?.symbol ?? "";
      return [
        {
          symbol: sym,
          name: symbolNames[sym] ?? sym,
          price: meta?.regularMarketPrice ?? 0,
          changePercent: meta?.regularMarketChangePercent ?? 0,
        },
      ];
    }
    // Try marketSummaryResponse format
    const summaries = data?.marketSummaryResponse?.result ?? [];
    return summaries.map((s: Record<string, unknown>) => {
      const sym = String((s as Record<string, unknown>)?.symbol ?? "");
      return {
        symbol: sym,
        name: symbolNames[sym] ?? sym,
        price: Number(
          (
            (s as Record<string, Record<string, unknown>>)
              ?.regularMarketPrice as Record<string, unknown>
          )?.raw ?? 0,
        ),
        changePercent: Number(
          (
            (s as Record<string, Record<string, unknown>>)
              ?.regularMarketChangePercent as Record<string, unknown>
          )?.raw ?? 0,
        ),
      };
    });
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatchlist();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStockQuote(symbol: string, enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<StockQuote>({
    queryKey: ["stockQuote", symbol],
    queryFn: async () => {
      if (!actor)
        return {
          symbol,
          price: 0,
          changePercent: 0,
          currency: "USD",
          name: symbol,
        };
      const json = await actor.fetchStockQuote(symbol);
      return parseStockQuote(json, symbol);
    },
    enabled: !!actor && !isFetching && enabled && !!symbol,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useMarketSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<MarketIndex[]>({
    queryKey: ["marketSummary"],
    queryFn: async () => {
      if (!actor) return [];
      const json = await actor.fetchMarketSummary();
      return parseMarketSummary(json);
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });
}

export function useFinancialNews(symbol: string, enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<NewsItem[]>({
    queryKey: ["news", symbol],
    queryFn: async () => {
      if (!actor) return [];
      const json = await actor.fetchFinancialNews(symbol);
      return parseNews(json);
    },
    enabled: !!actor && !isFetching && enabled && !!symbol,
    staleTime: 300_000,
  });
}

export function usePublishedArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["publishedArticles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOwnArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["ownArticles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOwnArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToWatchlist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.addToWatchlist(symbol.toUpperCase());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useRemoveFromWatchlist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.removeFromWatchlist(symbol);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useCreateArticle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      body,
      author,
    }: { title: string; body: string; author: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.createArticle(title, body, author);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ownArticles"] });
      qc.invalidateQueries({ queryKey: ["publishedArticles"] });
    },
  });
}

export function usePublishArticle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (timestamp: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.publishArticle(timestamp);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ownArticles"] });
      qc.invalidateQueries({ queryKey: ["publishedArticles"] });
    },
  });
}
