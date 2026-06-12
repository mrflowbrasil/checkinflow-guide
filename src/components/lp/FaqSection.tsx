import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { openQuickSignup } from "@/components/lp/QuickSignupDialog";

const faqs = [
  {
    q: "O que é o Welcome Hub?",
    a: "O Welcome Hub é uma plataforma para criar guias digitais de boas-vindas com todas as informações importantes da estadia, como check-in, Wi-Fi, regras da casa, localização, contatos e dicas da região.",
  },
  {
    q: "O hóspede precisa criar conta?",
    a: "Não. O hóspede acessa diretamente pelo link público ou pelo QR Code, sem cadastro, sem senha e sem baixar aplicativo.",
  },
  {
    q: "O Welcome Hub substitui o PDF de boas-vindas?",
    a: "Sim. Em vez de enviar arquivos pesados ou mensagens soltas, você entrega um guia online, organizado, fácil de atualizar e pensado para o acesso pelo celular.",
  },
  {
    q: "Posso usar em mais de um imóvel?",
    a: "Sim. Cada imóvel cadastrado possui seu próprio guia digital, link público e QR Code. Os planos variam conforme a quantidade de imóveis da sua operação.",
  },
  {
    q: "Como funcionam os planos?",
    a: "Os planos são definidos pela quantidade de imóveis cadastrados. Você pode escolher entre Single, Starter, Pro, Business ou Enterprise, de acordo com o tamanho da sua operação.",
  },
  {
    q: "Tem teste grátis?",
    a: "Sim. Você pode começar com 30 dias grátis, sem precisar cadastrar cartão de crédito.",
  },
  {
    q: "Sou cobrado automaticamente após o teste?",
    a: "Não. Ao final do período gratuito, você decide se deseja contratar um plano. Nenhuma cobrança é realizada automaticamente sem sua confirmação.",
  },
  {
    q: "Funciona para Airbnb, Booking e aluguel direto?",
    a: "Sim. O guia pode ser usado com hóspedes vindos do Airbnb, Booking, WhatsApp, site próprio, Instagram ou qualquer outro canal de reserva.",
  },
  {
    q: "Posso enviar o guia pelo WhatsApp?",
    a: "Sim. Basta copiar o link do guia e enviar pelo WhatsApp, e-mail, mensagem automática ou qualquer canal de comunicação com o hóspede.",
  },
  {
    q: "Posso imprimir um QR Code para deixar no imóvel?",
    a: "Sim. Cada guia gera um QR Code exclusivo. Você também pode gerar um cartão de boas-vindas em formato A4 para imprimir e deixar no imóvel.",
  },
  {
    q: "O Welcome Hub tem integrações?",
    a: "Sim. O Welcome Hub possui recursos para operações que utilizam sistemas como Stays, Hospedin e Hostaway, além de API para integrações com ferramentas externas.",
  },
  {
    q: "Vocês ajudam na configuração?",
    a: "Sim. Quando necessário, oferecemos suporte direto pelo WhatsApp para ajudar na configuração da plataforma, integrações e importação de imóveis.",
  },
];

const CYAN = "hsl(186 100% 32%)";

const ctaPrimary =
  "h-14 px-7 rounded-2xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold shadow-[0_10px_30px_-10px_hsl(186_100%_32%/0.5)] text-base";
const ctaSecondary =
  "h-14 px-7 rounded-2xl bg-white border-2 border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] hover:bg-[hsl(186_100%_32%)]/5 font-semibold text-base";

function scrollToDemo(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function FaqSection() {
  return (
    <section id="faq" className="py-20 lg:py-28 bg-gradient-to-b from-white via-[hsl(186_100%_98%)] to-white">
      <div className="container max-w-4xl mx-auto px-5 sm:px-8">
        <header className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(186_100%_94%)] border border-[hsl(186_100%_32%)]/20 text-xs font-semibold tracking-wide uppercase text-[hsl(186_100%_24%)]">
            <HelpCircle className="h-3.5 w-3.5" />
            Perguntas frequentes
          </span>
          <h2 className="mt-5 text-3xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Perguntas frequentes
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            Tire suas principais dúvidas sobre como funciona o Welcome Hub, os planos disponíveis e a experiência do hóspede.
          </p>
        </header>

        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_20px_-10px_rgba(15,23,42,0.1)] overflow-hidden data-[state=open]:shadow-[0_8px_30px_-15px_rgba(15,23,42,0.15)] transition-shadow"
            >
              <AccordionTrigger className="px-5 sm:px-7 py-5 text-left text-slate-900 font-semibold text-base sm:text-lg hover:no-underline hover:bg-slate-50/40 transition-colors [&[data-state=open]>svg]:text-[hsl(186_100%_32%)]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="px-5 sm:px-7 pb-5 text-slate-600 leading-relaxed text-[15px]">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 lg:mt-20 text-center">
          <div className="p-8 lg:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-[0_10px_40px_-20px_rgba(15,23,42,0.15)]">
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">
              Pronto para criar seu primeiro guia digital?
            </h3>
            <p className="text-slate-600 leading-relaxed max-w-xl mx-auto mb-6">
              Comece grátis e veja como é simples organizar seus imóveis e entregar uma experiência mais profissional para seus hóspedes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                type="button"
                onClick={openQuickSignup}
                className={ctaPrimary}
              >
                Criar meu guia grátis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={scrollToDemo}
                className={ctaSecondary}
              >
                Ver demonstração
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
