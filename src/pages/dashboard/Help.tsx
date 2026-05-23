import { useMemo, useState } from "react";
import { HelpCircle, Search, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { HELP_TOPICS, type HelpTopic } from "./help/topics";
import { cn } from "@/lib/utils";

function TopicContent({ topic }: { topic: HelpTopic }) {
  return (
    <article className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{topic.title}</h2>
        <p className="text-muted-foreground">{topic.description}</p>
      </header>

      {topic.sections.map((section, idx) => (
        <section key={idx} className="space-y-3">
          {section.heading && (
            <h3 className="text-base font-semibold text-foreground">{section.heading}</h3>
          )}
          {section.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/80">
              {p}
            </p>
          ))}
          {section.steps && (
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-foreground/80 marker:text-muted-foreground">
              {section.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}
          {section.tip && (
            <div className="flex gap-3 rounded-md border border-accent/30 bg-accent-soft p-3 text-sm">
              <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-accent-foreground" />
              <span className="text-accent-foreground">{section.tip}</span>
            </div>
          )}
        </section>
      ))}
    </article>
  );
}

export default function Help() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(HELP_TOPICS[0].id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELP_TOPICS;
    return HELP_TOPICS.filter((t) =>
      [t.title, t.description, ...t.keywords].some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  const activeTopic =
    HELP_TOPICS.find((t) => t.id === activeId) ?? filtered[0] ?? HELP_TOPICS[0];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <HelpCircle className="h-4 w-4" />
          <span>Central de Ajuda</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Como usar a plataforma</h1>
        <p className="text-muted-foreground max-w-2xl">
          Tutoriais passo a passo das principais funcionalidades. Use a busca para encontrar um tópico específico.
        </p>
        <div className="relative max-w-md pt-2">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground" />
          <Input
            placeholder="Buscar tópico (ex.: QR Code, imagem...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Card className="p-2">
            <nav className="flex flex-col">
              {(filtered.length ? filtered : HELP_TOPICS).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "text-left px-3 py-2 rounded-md text-sm transition-colors",
                    t.id === activeTopic.id
                      ? "bg-accent-soft text-accent-foreground font-medium"
                      : "hover:bg-muted text-foreground/80"
                  )}
                >
                  {t.title}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground">Nenhum tópico encontrado.</p>
              )}
            </nav>
          </Card>
        </aside>

        <Card className="p-6 md:p-8">
          <TopicContent topic={activeTopic} />
        </Card>
      </div>
    </div>
  );
}
