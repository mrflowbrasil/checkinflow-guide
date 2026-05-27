import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Seo } from "@/components/Seo";
import { MrFlowLogo } from "@/components/brand/MrFlowLogo";
import termsRaw from "@/content/terms-of-service.txt?raw";

// Detect section headings like "1. TITLE", "12.3.", etc.
const SECTION_RE = /^\d+\.\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9 ,\-—/]+$/;
const TITLE_RE = /^TERMOS DE SERVIÇO/i;
const UPDATED_RE = /^Última atualização/i;
const ROMAN_LIST_RE = /^[IVX]+\.\s/;

function renderContent(raw: string) {
  const lines = raw.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ol key={`ol-${key}`} className="list-none pl-0 space-y-1.5 my-3 text-foreground/80">
        {listBuffer.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed">{item}</li>
        ))}
      </ol>
    );
    listBuffer = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`b-${idx}`);
      return;
    }
    if (TITLE_RE.test(trimmed)) {
      flushList(`t-${idx}`);
      return; // title handled by header
    }
    if (UPDATED_RE.test(trimmed)) {
      flushList(`u-${idx}`);
      nodes.push(
        <p key={idx} className="text-xs text-muted-foreground mt-8 pt-6 border-t">{trimmed}</p>
      );
      return;
    }
    if (SECTION_RE.test(trimmed)) {
      flushList(`s-${idx}`);
      nodes.push(
        <h2 key={idx} className="text-lg md:text-xl font-semibold tracking-tight mt-8 mb-3 text-foreground">
          {trimmed}
        </h2>
      );
      return;
    }
    if (ROMAN_LIST_RE.test(trimmed)) {
      listBuffer.push(trimmed);
      return;
    }
    flushList(`p-${idx}`);
    nodes.push(
      <p key={idx} className="text-sm leading-relaxed text-foreground/80 my-2">
        {trimmed}
      </p>
    );
  });
  flushList("end");
  return nodes;
}

export default function Terms() {
  const content = renderContent(termsRaw);
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Termos de Serviço — Mr Flow Welcome Hub"
        description="Termos e condições de uso da plataforma Mr Flow Welcome Hub: regras de assinatura, responsabilidades, propriedade intelectual, LGPD e mais."
        path="/termos"
      />
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <MrFlowLogo className="h-7 w-auto" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
              Welcome Hub
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
          Termos de Serviço
        </h1>
        <p className="text-muted-foreground mb-8">
          Mr Flow Welcome Hub — condições de uso da plataforma.
        </p>
        <article>{content}</article>
      </main>
    </div>
  );
}
