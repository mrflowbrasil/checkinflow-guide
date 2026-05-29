import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import mrFlowLogoWhite from "@/assets/mrflow-logo-white.png";
import ShaderBackground from "@/components/ui/shader-background";
import { Seo } from "@/components/Seo";

const HERO_BG = {
  background:
    "radial-gradient(1200px 600px at 20% 10%, rgba(0,255,255,0.15), transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(0,140,142,0.25), transparent 60%), linear-gradient(135deg, #020617 0%, #0a1f2e 50%, #062a33 100%)",
};

export interface FaqItem {
  q: string;
  a: string;
}

export interface SeoLandingProps {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: ReactNode;
  intro: ReactNode;
  sections: { title: string; body: ReactNode }[];
  faq: FaqItem[];
  internalLinks: { to: string; label: string; desc: string }[];
  ctaPrimary?: string;
  /** Optional external URL for the primary CTA. When set, the CTA opens in a new tab instead of routing to /auth. */
  ctaHref?: string;
  /** ISO 8601 date (e.g. "2026-01-15"). Required by convention for new posts. */
  datePublished?: string;
  /** ISO 8601 date. Defaults to datePublished. Update whenever content changes. */
  dateModified?: string;
  /** Author. Defaults to Mr Flow Organization. */
  author?: { name: string; url?: string };
  articleType?: "Article" | "BlogPosting";
}

const DEFAULT_DATE_PUBLISHED = "2026-01-15";
const DEFAULT_DATE_MODIFIED = "2026-05-29";
const DEFAULT_AUTHOR = { name: "Mr Flow", url: "https://hub.mrflow.com.br" };
const PUBLISHER_LOGO =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/QOxsOCPLdoWqcZHw4rluKIZw7h52/social-images/social-1777558596702-Logo_Welcome_Hub.webp";

export function SeoLandingLayout({
  path,
  title,
  description,
  eyebrow,
  h1,
  intro,
  sections,
  faq,
  internalLinks,
  ctaPrimary = "Criar conta grátis",
  datePublished = DEFAULT_DATE_PUBLISHED,
  dateModified,
  author = DEFAULT_AUTHOR,
  articleType = "Article",
}: SeoLandingProps) {
  const finalDateModified = dateModified ?? DEFAULT_DATE_MODIFIED ?? datePublished;
  const canonicalUrl = `https://hub.mrflow.com.br${path}`;

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Mr Flow Welcome Hub",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description,
    url: canonicalUrl,
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    publisher: { "@type": "Organization", name: "Mr. Flow Automações e Serviços Digitais LTDA" },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: "https://hub.mrflow.com.br/" },
      { "@type": "ListItem", position: 2, name: eyebrow, item: canonicalUrl },
    ],
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": articleType,
    headline: title,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
    datePublished,
    dateModified: finalDateModified,
    inLanguage: "pt-BR",
    author: {
      "@type": "Organization",
      name: author.name,
      ...(author.url ? { url: author.url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Mr. Flow Automações e Serviços Digitais LTDA",
      logo: { "@type": "ImageObject", url: PUBLISHER_LOGO },
    },
    image: PUBLISHER_LOGO,
  };

  return (
    <div className="min-h-screen flex flex-col text-white relative" style={HERO_BG}>
      <Seo
        title={title}
        description={description}
        path={path}
        type="article"
        datePublished={datePublished}
        dateModified={finalDateModified}
        author={author}
        jsonLd={[articleLd, softwareLd, faqLd, breadcrumbLd]}
      />
      <ShaderBackground className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-75" />

      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#020617]/40 border-b border-white/10">
        <div className="container px-6 sm:px-10 lg:px-20 xl:px-32 flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col items-start gap-0.5">

            <img src={mrFlowLogoWhite} alt="Mr Flow Welcome Hub" className="h-8 w-auto" />
            <span className="text-[9px] tracking-[0.25em] text-white/70 uppercase">Welcome Hub</span>
          </Link>
          <Button asChild size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl backdrop-blur">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="container px-6 sm:px-10 lg:px-20 xl:px-32 py-16 lg:py-24 max-w-4xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-white/60">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-white/90 underline-offset-2 hover:underline">Início</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/85">{eyebrow}</li>
            </ol>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" style={{ color: "#00FFFF" }} /> {eyebrow}
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-6 leading-[1.1] text-white">{h1}</h1>
          <div className="text-base lg:text-lg leading-relaxed text-white/80 mb-8 space-y-4">{intro}</div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg">
              <Link to="/auth">{ctaPrimary} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Link to="/">Conhecer o Mr Flow</Link>
            </Button>
          </div>
        </section>

        <section className="container px-6 sm:px-10 lg:px-20 xl:px-32 max-w-4xl mx-auto pb-16 space-y-10">
          {sections.map((s) => (
            <article key={s.title} className="p-6 lg:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 text-white">{s.title}</h2>
              <div className="text-white/80 leading-relaxed space-y-3">{s.body}</div>
            </article>
          ))}
        </section>

        <section className="container px-6 sm:px-10 lg:px-20 xl:px-32 max-w-4xl mx-auto pb-16">
          <h2 className="text-2xl font-semibold mb-6 text-white">Perguntas frequentes</h2>
          <div className="space-y-3">
            {faq.map((f, i) => <FaqRow key={i} item={f} />)}
          </div>
        </section>

        <section className="container px-6 sm:px-10 lg:px-20 xl:px-32 max-w-4xl mx-auto pb-16">
          <h2 className="text-2xl font-semibold mb-6 text-white">Continue explorando</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {internalLinks.map((l) => (
              <Link key={l.to} to={l.to} className="block p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                <div className="font-semibold text-white mb-1">{l.label}</div>
                <div className="text-sm text-white/70">{l.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="container px-6 sm:px-10 lg:px-20 xl:px-32 max-w-4xl mx-auto pb-24 text-center">
          <div className="p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 border border-white/15">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Comece grátis em menos de 2 minutos</h2>
            <p className="text-white/80 mb-6">Crie seu Hub de Boas Vindas e impressione seus hóspedes na próxima reserva.</p>
            <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg">
              <Link to="/auth">{ctaPrimary} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-white/10 py-8 text-center text-xs text-white/50 px-4 relative z-10">
        © 2026 –{" "}
        <a href="http://mrflow.com.br" target="_blank" rel="noreferrer noopener" className="underline hover:text-white/80">
          Mr. Flow Automações e Serviços Digitais LTDA
        </a>{" "}
        – CNPJ 57.466.519/0001-87 – Todos os direitos reservados.
      </footer>
    </div>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 text-left p-4 hover:bg-white/[0.03]">
        <span className="font-medium text-white">{item.q}</span>
        <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-white/75 leading-relaxed">{item.a}</div>}
    </div>
  );
}
