import { SeoLandingLayout } from "@/components/seo/SeoLandingLayout";
import { Link } from "react-router-dom";

const ALL_LINKS = [
  { to: "/check-in-digital-airbnb", label: "Check-in digital para Airbnb", desc: "Receba o hóspede sem precisar estar presente." },
  { to: "/qr-code-para-hospedes", label: "QR Code para hóspedes", desc: "Um adesivo no apartamento que abre o seu hub." },
  { to: "/manual-da-casa-airbnb", label: "Manual da casa Airbnb", desc: "Wi-Fi, eletrodomésticos e regras em um link." },
  { to: "/app-para-hospedes", label: "App para hóspedes", desc: "Experiência mobile sem instalar nada." },
  { to: "/experiencia-do-hospede", label: "Experiência do hóspede", desc: "Hospitalidade do convite ao check-out." },
  { to: "/como-reduzir-perguntas-no-whatsapp", label: "Reduzir perguntas no WhatsApp", desc: "Menos mensagens, mais autonomia." },
  { to: "/como-melhorar-avaliacoes-airbnb", label: "Melhorar avaliações no Airbnb", desc: "5 estrelas com método, não com sorte." },
  { to: "/como-organizar-check-in-airbnb", label: "Organizar o check-in do Airbnb", desc: "Fluxo passo a passo para anfitriões." },
  { to: "/guia-digital-airbnb", label: "Guia digital para Airbnb", desc: "Tudo que o hóspede precisa, em um link." },
  { to: "/manual-digital-airbnb", label: "Manual digital do Airbnb", desc: "Substitua o caderno impresso." },
  { to: "/hub-de-boas-vindas", label: "Hub de Boas Vindas", desc: "A primeira impressão digital do imóvel." },
  { to: "/guest-app-airbnb", label: "Guest app para Airbnb", desc: "PWA sem download obrigatório." },
  { to: "/guia-do-hospede", label: "Guia do hóspede", desc: "Modelo pronto, comprovado." },
  { to: "/app-para-anfitriao", label: "App para anfitrião", desc: "Gestão de imóveis e guias." },
];

function linksFor(path: string, related: string[]) {
  const ordered = related
    .map((r) => ALL_LINKS.find((l) => l.to === r))
    .filter((l): l is (typeof ALL_LINKS)[number] => Boolean(l) && l!.to !== path);
  const extras = ALL_LINKS.filter((l) => l.to !== path && !ordered.includes(l));
  return [...ordered, ...extras].slice(0, 4);
}

export function CheckInDigitalAirbnb() {
  const path = "/check-in-digital-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Check-in digital para Airbnb — autônomo e sem chave | Mr Flow"
      description="Implemente check-in digital no seu Airbnb com instruções, vídeo, mapa e suporte 24h. Sem chaveiro, sem espera, sem retrabalho."
      eyebrow="Check-in digital para Airbnb"
      h1={<>Check-in <span style={{ color: "#00FFFF" }}>digital</span> que funciona sozinho</>}
      intro={
        <>
          <p>O check-in é o momento mais sensível da hospedagem. Atrasos, ruídos no WhatsApp e portas que não abrem destroem qualquer avaliação. O check-in digital resolve isso com instruções claras enviadas no momento certo.</p>
          <p>Com o Mr Flow Welcome Hub, você publica um fluxo passo a passo, com fotos, vídeo e botão de emergência, acessível por link e QR Code.</p>
        </>
      }
      sections={[
        { title: "O que é check-in digital", body: <p>É o processo em que o próprio hóspede acessa o imóvel sem encontro presencial, usando código, fechadura inteligente ou retirada de chave em local indicado. Tudo guiado por um link único enviado antes da chegada.</p> },
        { title: "Etapas obrigatórias", body: <ol className="list-decimal pl-5 space-y-1"><li>Mensagem de confirmação 24h antes</li><li>Endereço com mapa e ponto de referência</li><li>Acesso ao prédio e ao apartamento (vídeo curto)</li><li>Wi-Fi com botão de copiar</li><li>Suporte direto: WhatsApp e telefone</li></ol> },
        { title: "Quando o check-in dá errado", body: <p>Geralmente por instrução ambígua. Padronize: foto da fachada com seta, número do andar destacado, vídeo de 15s mostrando a fechadura. <Link to="/como-organizar-check-in-airbnb" className="underline text-cyan-300">Veja como organizar o check-in</Link>.</p> },
      ]}
      faq={[
        { q: "Funciona com fechadura comum?", a: "Sim. Você pode indicar onde a chave está (cofre, recepção, porteiro). A fechadura inteligente é opcional." },
        { q: "E se o hóspede não souber usar?", a: "O hub tem um botão de emergência que liga direto para você ou seu suporte, e o vídeo de check-in cobre 95% das dúvidas." },
        { q: "Posso oferecer check-in flexível?", a: "Sim. O hub fica disponível 24h e o hóspede acessa quando chega — independentemente do horário." },
        { q: "Substitui o app da plataforma?", a: "Não substitui, complementa. O hóspede continua usando o Airbnb/Booking para se comunicar, mas tem todas as informações no seu hub." },
      ]}
      internalLinks={linksFor(path, ["/como-organizar-check-in-airbnb", "/qr-code-para-hospedes", "/manual-da-casa-airbnb", "/app-para-hospedes"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function QrCodeParaHospedes() {
  const path = "/qr-code-para-hospedes";
  return (
    <SeoLandingLayout
      path={path}
      title="QR Code para hóspedes — adesivo do Welcome Hub | Mr Flow"
      description="Gere um QR Code para hóspedes que abre o seu manual digital direto no celular. Cole no apartamento e elimine perguntas básicas."
      eyebrow="QR Code para hóspedes"
      h1={<><span style={{ color: "#00FFFF" }}>QR Code</span> para hóspedes em segundos</>}
      intro={
        <>
          <p>Um QR Code colado na geladeira ou na entrada vale mais do que dez mensagens explicando o Wi-Fi. O hóspede aponta o celular, abre o seu hub e encontra tudo o que precisa.</p>
          <p>O Mr Flow gera um QR Code automático para cada imóvel — pronto para imprimir.</p>
        </>
      }
      sections={[
        { title: "Onde colar o QR Code", body: <ul className="list-disc pl-5 space-y-1"><li>Porta de entrada (lado de dentro)</li><li>Geladeira ou bancada da cozinha</li><li>Mesa de cabeceira</li><li>Banheiro (instruções de chuveiro)</li><li>Quadro de boas-vindas, junto à mensagem</li></ul> },
        { title: "Por que QR Code funciona melhor que panfleto", body: <p>Panfleto envelhece, QR Code é eterno. Você atualiza o conteúdo por trás dele a qualquer hora — Wi-Fi novo, regra nova, dica nova — sem reimprimir nada.</p> },
        { title: "Boas práticas de impressão", body: <p>Imprima em tamanho mínimo de 4x4 cm, em fundo claro, com a frase "Aponte a câmera para acessar o guia". Inclua sua logo se possível.</p> },
      ]}
      faq={[
        { q: "Preciso de aplicativo para ler o QR Code?", a: "Não. iPhone e Android leem QR Code nativamente pela câmera, sem instalar nada." },
        { q: "O QR Code vence depois de um tempo?", a: "Não. Ele aponta para o link público do seu imóvel e funciona enquanto o imóvel estiver ativo no Mr Flow." },
        { q: "Posso usar a mesma arte para vários imóveis?", a: "Não, cada imóvel tem um QR Code único — para que o conteúdo seja específico daquele endereço." },
        { q: "Posso baixar em alta resolução?", a: "Sim. O Mr Flow disponibiliza o QR Code em PNG e PDF prontos para impressão." },
      ]}
      internalLinks={linksFor(path, ["/check-in-digital-airbnb", "/hub-de-boas-vindas", "/manual-da-casa-airbnb", "/app-para-hospedes"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ManualDaCasaAirbnb() {
  const path = "/manual-da-casa-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Manual da casa Airbnb — modelo digital pronto | Mr Flow"
      description="Crie um manual da casa para Airbnb com regras, eletrodomésticos, Wi-Fi e check-out em um link. Modelo pronto e atualizável a qualquer hora."
      eyebrow="Manual da casa Airbnb"
      h1={<>Manual da <span style={{ color: "#00FFFF" }}>casa</span> que ninguém ignora</>}
      intro={
        <>
          <p>O manual da casa é o documento que evita 80% dos problemas durante a estadia. Quando ele é claro, curto e visual, o hóspede consulta. Quando é um PDF longo, ele ignora.</p>
          <p>O Mr Flow Welcome Hub entrega um modelo digital pronto, em blocos visuais e mobile-first.</p>
        </>
      }
      sections={[
        { title: "Estrutura mínima recomendada", body: <ol className="list-decimal pl-5 space-y-1"><li>Boas-vindas e Wi-Fi</li><li>Como usar TV, ar-condicionado e cozinha</li><li>Regras da casa (silêncio, festas, animais)</li><li>Coleta de lixo e reciclagem</li><li>Check-out passo a passo</li><li>Contatos de emergência</li></ol> },
        { title: "Diferença entre manual da casa e guia do hóspede", body: <p>Manual = instruções operacionais. Guia = boas-vindas, dicas de bairro e experiência. <Link to="/guia-do-hospede" className="underline text-cyan-300">Veja o guia do hóspede</Link> para entender como combinar os dois.</p> },
        { title: "Atualização sem dor", body: <p>Trocou o roteador? Edite um bloco e o próximo hóspede já vê a senha nova. Sem reimpressão, sem retrabalho.</p> },
      ]}
      faq={[
        { q: "Posso usar imagens dos meus eletrodomésticos?", a: "Sim. Cada bloco aceita fotos com legendas para facilitar o entendimento." },
        { q: "Existe template pronto?", a: "Sim. O Mr Flow inclui templates de manual da casa para apartamento urbano, casa de praia e chalé." },
        { q: "Funciona em mais de um idioma?", a: "Sim. O manual é traduzido automaticamente para português, inglês e espanhol." },
        { q: "Posso esconder seções de hóspedes específicos?", a: "Você publica um manual padrão por imóvel; mensagens privadas continuam pelo canal de reserva." },
      ]}
      internalLinks={linksFor(path, ["/manual-digital-airbnb", "/guia-do-hospede", "/qr-code-para-hospedes", "/check-in-digital-airbnb"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function AppParaHospedes() {
  const path = "/app-para-hospedes";
  return (
    <SeoLandingLayout
      path={path}
      title="App para hóspedes — sem instalar nada | Mr Flow"
      description="App para hóspedes em formato PWA: abre direto no link, instala como ícone na tela inicial e funciona em qualquer celular."
      eyebrow="App para hóspedes"
      h1={<>App para <span style={{ color: "#00FFFF" }}>hóspedes</span> sem fricção</>}
      intro={
        <>
          <p>Hóspedes não querem baixar mais um app para uma estadia de 3 dias. Por isso, o app do hóspede no Mr Flow é um PWA: abre direto no link e, se o hóspede quiser, vira um ícone no celular.</p>
          <p>Resultado: 100% de adoção, zero atrito.</p>
        </>
      }
      sections={[
        { title: "O que o hóspede consegue fazer no app", body: <ul className="list-disc pl-5 space-y-1"><li>Ver instruções de check-in com vídeo</li><li>Copiar o Wi-Fi com 1 toque</li><li>Abrir o mapa de dicas do bairro</li><li>Pedir suporte ao anfitrião</li><li>Trocar idioma para inglês ou espanhol</li></ul> },
        { title: "PWA vs app nativo", body: <p>App nativo exige loja, atualização, espaço. PWA abre na hora. Para uso pontual, é a escolha certa — e é o que o Airbnb e Booking também recomendam para experiências de curta duração.</p> },
        { title: "Como o hóspede recebe", body: <p>Você envia o link pelo canal da plataforma ou WhatsApp. Ele clica e está dentro. Se quiser, instala o atalho com um toque. <Link to="/guest-app-airbnb" className="underline text-cyan-300">Veja o guest app</Link>.</p> },
      ]}
      faq={[
        { q: "Funciona em iPhone e Android?", a: "Sim. Funciona em qualquer celular moderno com Safari, Chrome ou navegador padrão." },
        { q: "Precisa de conta ou senha?", a: "Não. O acesso é por link público, sem cadastro do hóspede." },
        { q: "Funciona offline?", a: "Após o primeiro acesso, o conteúdo essencial fica disponível mesmo sem conexão estável." },
        { q: "É seguro?", a: "Sim. Você controla o conteúdo e pode desativar o link a qualquer momento." },
      ]}
      internalLinks={linksFor(path, ["/guest-app-airbnb", "/qr-code-para-hospedes", "/check-in-digital-airbnb", "/experiencia-do-hospede"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ExperienciaDoHospede() {
  const path = "/experiencia-do-hospede";
  return (
    <SeoLandingLayout
      path={path}
      title="Experiência do hóspede — guia completo para anfitriões | Mr Flow"
      description="Como projetar uma experiência do hóspede de ponta no aluguel por temporada: do convite ao check-out, com hospitalidade digital."
      eyebrow="Experiência do hóspede"
      h1={<>Experiência do <span style={{ color: "#00FFFF" }}>hóspede</span> de ponta a ponta</>}
      intro={
        <>
          <p>Avaliações 5 estrelas não nascem do imóvel — nascem da jornada. A experiência do hóspede começa no momento em que ele clica em reservar e termina dias depois, na avaliação.</p>
          <p>Veja como mapear cada ponto de contato e usar o Mr Flow Welcome Hub para entregar hospitalidade em escala.</p>
        </>
      }
      sections={[
        { title: "Os 5 momentos críticos", body: <ol className="list-decimal pl-5 space-y-1"><li>Pré-chegada: confirmação e convite ao hub</li><li>Chegada: check-in claro e sem ruído</li><li>Estadia: autonomia para resolver dúvidas</li><li>Check-out: instruções diretas e sem cobrança</li><li>Pós-estadia: pedido de avaliação personalizado</li></ol> },
        { title: "Hospitalidade digital", body: <p>Não é só responder rápido — é antecipar. Um hóspede que encontra a senha do Wi-Fi sozinho avalia melhor do que um que precisou perguntar.</p> },
        { title: "Personalização sem inflar custos", body: <p>Templates reutilizáveis com cores e logo próprias dão sensação de marca em todos os imóveis. <Link to="/hub-de-boas-vindas" className="underline text-cyan-300">Veja o hub de boas-vindas</Link>.</p> },
      ]}
      faq={[
        { q: "Vale a pena para imóvel pequeno?", a: "Especialmente. Imóvel pequeno compete em experiência. Quem se diferencia em hospitalidade vence." },
        { q: "Como medir a experiência?", a: "Avaliações no Airbnb, recompras e número de mensagens de dúvida — quanto menos mensagens, melhor a experiência." },
        { q: "Quanto tempo leva para implantar?", a: "Em torno de 30 minutos para o primeiro imóvel. Os próximos saem em minutos com templates prontos." },
        { q: "Existe uma experiência ideal padrão?", a: "Existem boas práticas (clareza, antecipação, autonomia). Mas a experiência ideal é a que reflete a sua marca." },
      ]}
      internalLinks={linksFor(path, ["/hub-de-boas-vindas", "/como-melhorar-avaliacoes-airbnb", "/como-reduzir-perguntas-no-whatsapp", "/check-in-digital-airbnb"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ComoReduzirPerguntasNoWhatsApp() {
  const path = "/como-reduzir-perguntas-no-whatsapp";
  return (
    <SeoLandingLayout
      path={path}
      title="Como reduzir perguntas dos hóspedes no WhatsApp | Mr Flow"
      description="Reduza em até 70% as perguntas dos hóspedes no WhatsApp com um manual digital, FAQ visual e mensagens automáticas. Guia prático."
      eyebrow="Reduzir perguntas no WhatsApp"
      h1={<>Pare de responder o <span style={{ color: "#00FFFF" }}>Wi-Fi</span> 30 vezes por mês</>}
      intro={
        <>
          <p>Se você é anfitrião e o seu WhatsApp vibra a cada chegada, o problema não é o hóspede — é a falta de um canal de informação claro. Veja como reduzir mensagens repetitivas em até 70%.</p>
        </>
      }
      sections={[
        { title: "Mapeie as perguntas mais comuns", body: <ul className="list-disc pl-5 space-y-1"><li>Qual a senha do Wi-Fi?</li><li>Como funciona o ar-condicionado?</li><li>Onde está o lixo?</li><li>Que horas é o check-out?</li><li>Tem mercado por perto?</li></ul> },
        { title: "Crie blocos visuais para cada uma", body: <p>Cada pergunta vira um bloco no seu hub: título grande, resposta curta, foto se necessário. <Link to="/manual-da-casa-airbnb" className="underline text-cyan-300">Veja o modelo de manual da casa</Link>.</p> },
        { title: "Mensagem automática que resolve", body: <p>Configure a mensagem automática de boas-vindas no Airbnb com o link do hub. 80% das dúvidas se resolvem antes mesmo do hóspede pegar o celular.</p> },
      ]}
      faq={[
        { q: "Quanto tempo leva para perceber a diferença?", a: "Em torno de duas estadias. A partir da terceira reserva, o volume de mensagens cai significativamente." },
        { q: "E se o hóspede não acessar o link?", a: "Acessam. O QR Code dentro do imóvel garante o segundo ponto de contato e fecha o ciclo." },
        { q: "Funciona com hóspedes estrangeiros?", a: "Sim. O hub traduz para inglês e espanhol automaticamente, eliminando barreiras de idioma." },
        { q: "Vou parar de receber qualquer mensagem?", a: "Não. Mensagens importantes continuam — você se livra apenas das repetitivas e operacionais." },
      ]}
      internalLinks={linksFor(path, ["/manual-da-casa-airbnb", "/qr-code-para-hospedes", "/experiencia-do-hospede", "/como-melhorar-avaliacoes-airbnb"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ComoMelhorarAvaliacoesAirbnb() {
  const path = "/como-melhorar-avaliacoes-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Como melhorar avaliações no Airbnb — método em 5 passos | Mr Flow"
      description="Como melhorar suas avaliações no Airbnb com hospitalidade digital, check-in claro e manual da casa. Método prático para anfitriões."
      eyebrow="Melhorar avaliações no Airbnb"
      h1={<>Como subir para <span style={{ color: "#00FFFF" }}>5 estrelas</span> sem reformar o imóvel</>}
      intro={
        <>
          <p>A maioria das avaliações abaixo de 5 estrelas no Airbnb não é por causa do imóvel — é por causa de comunicação. Veja o método para virar essa chave.</p>
        </>
      }
      sections={[
        { title: "1. Antecipe a chegada", body: <p>Envie o hub 48h antes do check-in com endereço, vídeo e instruções. <Link to="/check-in-digital-airbnb" className="underline text-cyan-300">Veja o check-in digital</Link>.</p> },
        { title: "2. Elimine atritos óbvios", body: <p>Wi-Fi com botão de copiar, vídeo da fechadura, foto da fachada com seta. Um hóspede sem fricção é um hóspede generoso na avaliação.</p> },
        { title: "3. Surpreenda com dicas locais", body: <p>3 cafés, 3 restaurantes, 1 farmácia. Esse mini-roteiro aparece nos comentários positivos com frequência absurda.</p> },
        { title: "4. Peça a avaliação no momento certo", body: <p>Mensagem curta no check-out agradecendo e lembrando da avaliação. Funciona muito mais do que insistir depois.</p> },
        { title: "5. Padronize entre imóveis", body: <p>Templates iguais entre imóveis garantem consistência. <Link to="/hub-de-boas-vindas" className="underline text-cyan-300">Veja como criar um hub</Link>.</p> },
      ]}
      faq={[
        { q: "Quanto tempo até as notas subirem?", a: "Em geral, dentro de 5 a 10 reservas você nota o impacto na média de avaliações." },
        { q: "Funciona para imóveis novos sem histórico?", a: "Sim. É justamente nas primeiras avaliações que a hospitalidade digital faz mais diferença." },
        { q: "Preciso responder cada avaliação?", a: "Sim, mas com mensagens curtas e personalizadas. Isso reforça profissionalismo." },
        { q: "Avaliação ruim afeta meu Superhost?", a: "Sim. Por isso, o foco deve ser sempre prevenir, com clareza e antecipação." },
      ]}
      internalLinks={linksFor(path, ["/experiencia-do-hospede", "/check-in-digital-airbnb", "/como-reduzir-perguntas-no-whatsapp", "/manual-da-casa-airbnb"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ComoOrganizarCheckInAirbnb() {
  const path = "/como-organizar-check-in-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Como organizar o check-in do Airbnb — passo a passo | Mr Flow"
      description="Como organizar o check-in do seu Airbnb sem ruído: cronograma, mensagens, fluxo digital e check-list para anfitriões iniciantes."
      eyebrow="Organizar o check-in do Airbnb"
      h1={<>Como organizar o <span style={{ color: "#00FFFF" }}>check-in</span> sem virar refém do celular</>}
      intro={
        <>
          <p>Check-in mal organizado vira atraso, mensagem urgente e nota baixa. Check-in bem organizado é invisível — o hóspede chega, abre a porta e elogia. Veja o passo a passo.</p>
        </>
      }
      sections={[
        { title: "Cronograma ideal", body: <ol className="list-decimal pl-5 space-y-1"><li>48h antes: confirmação e link do hub</li><li>24h antes: lembrete com endereço e horário</li><li>3h antes: instruções finais e botão de suporte</li><li>Após chegada: mensagem rápida de boas-vindas</li></ol> },
        { title: "O que cada mensagem deve conter", body: <p>Endereço completo, vídeo de chegada, Wi-Fi, regras essenciais e contato de emergência. Tudo em um único link — o seu hub.</p> },
        { title: "Check-list de imóvel pronto", body: <ul className="list-disc pl-5 space-y-1"><li>Limpeza confirmada</li><li>Roteador funcionando</li><li>Instruções no QR Code visível</li><li>Suprimentos básicos repostos</li><li>Cofre/fechadura testados</li></ul> },
      ]}
      faq={[
        { q: "Preciso receber o hóspede pessoalmente?", a: "Não. Com check-in digital bem feito, o hóspede chega sozinho e o experiência fica até melhor." },
        { q: "E se o hóspede chegar fora do horário?", a: "O hub fica disponível 24h. Combine antecipadamente o horário e mantenha o suporte ativo." },
        { q: "Como evitar conflito de horário entre hóspedes?", a: "Tenha buffer mínimo de 3h entre check-out e check-in para garantir limpeza tranquila." },
        { q: "Devo cobrar early check-in?", a: "É uma escolha de gestão. Se cobrar, deixe a regra clara no anúncio e no hub." },
      ]}
      internalLinks={linksFor(path, ["/check-in-digital-airbnb", "/como-melhorar-avaliacoes-airbnb", "/como-reduzir-perguntas-no-whatsapp", "/manual-da-casa-airbnb"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}
