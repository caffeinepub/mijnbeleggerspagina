import { ExternalLink } from "lucide-react";
import type { NewsItem } from "../hooks/useQueries";

type Props = {
  item: NewsItem;
  index: number;
};

function formatTime(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);
  if (diff < 60) return `${diff}m geleden`;
  if (diff < 1440) return `${Math.floor(diff / 60)}u geleden`;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export default function NewsCard({ item, index }: Props) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 py-3 px-1 border-b border-border/50 last:border-0 hover:bg-muted/20 rounded-lg px-2 transition-colors group"
      data-ocid={`news.item.${index + 1}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-teal transition-colors">
          {item.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {item.publisher}
          </span>
          {item.providerPublishTime > 0 && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(item.providerPublishTime)}
              </span>
            </>
          )}
        </div>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-teal mt-0.5 flex-shrink-0 transition-colors" />
    </a>
  );
}
