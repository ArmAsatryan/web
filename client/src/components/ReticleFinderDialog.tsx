import { useLayoutEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/use-i18n";
import {
  pickRandomReticles,
  RETICLE_NAMES,
  searchReticles,
} from "@/lib/reticle-search";

function formatCta(template: string, count: number): string {
  return template.replace(/\{count\}/g, String(count));
}

export function ReticleFinderDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<string[]>([]);

  const total = RETICLE_NAMES.length;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setQuery("");
  };

  useLayoutEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length === 0) setItems(pickRandomReticles(10));
    else setItems(searchReticles(q, 200));
  }, [open, query]);

  const subtitle = useMemo(() => {
    const q = query.trim();
    if (q.length === 0) return t("reticles.finder.randomHint");
    if (items.length === 0) return t("reticles.finder.noResults");
    return t("reticles.finder.resultsCount").replace("{count}", String(items.length));
  }, [query, items.length, t]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-2 border-foreground/80 bg-background/90 px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background sm:px-7 sm:text-base dark:border-foreground/70 dark:bg-background/80"
          data-testid="button-reticle-finder"
        >
          {formatCta(t("reticles.finder.cta"), total)}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(85vh,40rem)] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
        <DialogHeader className="shrink-0 space-y-1 border-b px-6 pb-4 pt-6 pr-14 text-left">
          <DialogTitle>{t("reticles.finder.title")}</DialogTitle>
          <DialogDescription className="text-pretty">{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="shrink-0 border-b px-6 py-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("reticles.finder.searchPlaceholder")}
              className="h-10 pl-9"
              autoComplete="off"
              spellCheck={false}
              data-testid="input-reticle-search"
            />
          </div>
        </div>

        <ul
          className="min-h-0 flex-1 list-none space-y-0 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3"
          role="listbox"
          aria-label={t("reticles.finder.title")}
        >
          {items.map((line) => (
            <li
              key={line}
              className="rounded-md px-3 py-2.5 text-sm leading-snug text-foreground odd:bg-muted/40 hover:bg-muted/60"
            >
              {line}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
