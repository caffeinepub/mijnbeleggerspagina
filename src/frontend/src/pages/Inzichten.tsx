import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Globe,
  Loader2,
  Lock,
  PenLine,
  Plus,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Article } from "../backend.d";
import LoginPrompt from "../components/LoginPrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateArticle,
  useOwnArticles,
  usePublishArticle,
  usePublishedArticles,
} from "../hooks/useQueries";

function formatDate(ts: bigint): string {
  try {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function ArticleCard({
  article,
  index,
  onPublish,
}: { article: Article; index: number; onPublish?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
      data-ocid={`inzichten.item.${index + 1}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 border-0 ${
                article.published
                  ? "bg-[oklch(0.76_0.14_162/0.15)] text-positive"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {article.published ? (
                <>
                  <Globe className="h-2.5 w-2.5 mr-1 inline" />
                  Gepubliceerd
                </>
              ) : (
                <>
                  <Lock className="h-2.5 w-2.5 mr-1 inline" />
                  Concept
                </>
              )}
            </Badge>
            {article.timestamp > 0n && (
              <span className="text-xs text-muted-foreground">
                {formatDate(article.timestamp)}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {article.body}
          </p>
        </div>
        {!article.published && onPublish && (
          <Button
            size="sm"
            variant="outline"
            onClick={onPublish}
            className="shrink-0 text-xs border-primary/30 text-teal hover:bg-primary/10"
            data-ocid={`inzichten.edit_button.${index + 1}`}
          >
            <Send className="h-3 w-3 mr-1" />
            Publiceer
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function NewArticleDialog() {
  const { identity } = useInternetIdentity();
  const createMutation = useCreateArticle();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !body.trim()) {
      toast.error("Vul een titel en inhoud in");
      return;
    }
    const author = identity?.getPrincipal().toString() ?? "anoniem";
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        author,
      });
      toast.success(publish ? "Artikel gepubliceerd!" : "Concept opgeslagen!");
      setOpen(false);
      setTitle("");
      setBody("");
    } catch {
      toast.error("Kon artikel niet opslaan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-ocid="inzichten.open_modal_button"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nieuw Artikel
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border max-w-2xl w-full"
        data-ocid="inzichten.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <PenLine className="h-4 w-4 text-teal" />
            Nieuw Inzicht Schrijven
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm text-muted-foreground">
              Titel
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bijv. Mijn visie op de technologiesector Q2 2025"
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              data-ocid="inzichten.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body" className="text-sm text-muted-foreground">
              Inhoud
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Schrijf je beleggersanalyse hier... (kan ook samengesteld zijn met ChatGPT)"
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground min-h-[200px] resize-y"
              data-ocid="inzichten.textarea"
            />
          </div>
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            💡 Tip: Je kunt de inhoud laten samenstellen door ChatGPT en hier
            plakken voor professionele beleggersanalyses.
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={createMutation.isPending}
              className="border-border text-foreground hover:bg-muted"
              data-ocid="inzichten.save_button"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Lock className="h-3.5 w-3.5 mr-1.5" />
              )}
              Opslaan als concept
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="inzichten.submit_button"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Globe className="h-3.5 w-3.5 mr-1.5" />
              )}
              Publiceren
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Inzichten() {
  const { identity } = useInternetIdentity();
  const { data: published, isLoading: pubLoading } = usePublishedArticles();
  const { data: own, isLoading: ownLoading } = useOwnArticles();
  const publishMutation = usePublishArticle();

  if (!identity) {
    return (
      <LoginPrompt message="Log in om inzichten te lezen en te publiceren." />
    );
  }

  const handlePublish = async (ts: bigint) => {
    try {
      await publishMutation.mutateAsync(ts);
      toast.success("Artikel gepubliceerd!");
    } catch {
      toast.error("Kon artikel niet publiceren");
    }
  };

  const drafts = own?.filter((a) => !a.published) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mijn Inzichten</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schrijf en publiceer je beleggersanalyses
          </p>
        </div>
        <NewArticleDialog />
      </motion.div>

      {/* Drafts */}
      {drafts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Concepten ({drafts.length})
          </h2>
          <div className="space-y-3">
            {drafts.map((a, i) => (
              <ArticleCard
                key={String(a.timestamp)}
                article={a}
                index={i}
                onPublish={() => handlePublish(a.timestamp)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Published */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Gepubliceerde Inzichten ({published?.length ?? 0})
        </h2>
        <Card className="bg-card border-border shadow-card">
          <CardContent className="pt-4">
            {pubLoading || ownLoading ? (
              <div className="space-y-3" data-ocid="inzichten.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : published && published.length > 0 ? (
              <div className="space-y-3">
                {published.map((a, i) => (
                  <ArticleCard
                    key={String(a.timestamp)}
                    article={a}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-12"
                data-ocid="inzichten.empty_state"
              >
                <BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nog geen gepubliceerde inzichten
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Schrijf je eerste beleggersanalyse!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
