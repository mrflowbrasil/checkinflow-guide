import { SeoLandingLayout } from "@/components/seo/SeoLandingLayout";
import { Link } from "react-router-dom";

const REQUIRED_LINKS = [
  { to: "/guia-digital-airbnb", label: "Guia digital para Airbnb", desc: "Tudo que o hóspede precisa, em um link." },
  { to: "/manual-digital-airbnb", label: "Manual digital do Airbnb", desc: "Substitua o caderno impresso." },
  { to: "/hub-de-boas-vindas", label: "Hub de Boas Vindas", desc: "A primeira impressão digital do imóvel." },
  { to: "/guest-app-airbnb", label: "Guest app para Airbnb", desc: "PWA sem download obrigatório." },
  { to: "/app-para-anfitriao", label: "App para anfitrião", desc: "Gestão de imóveis e guias." },
  { to: "/guia-do-hospede", label: "Guia do hóspede", desc: "Modelo pronto, comprovado." },
];

const EXTRA_LINKS = [
  { to: "/integracao-hostaway", label: "Integração com Hostaway", desc: "Hostaway + guia digital com QR Code." },
  { to: "/integracao-stays", label: "Integração com Stays", desc: "Automatize a hospedagem na Stays." },
  { to: "/integracao-airbnb", label: "Integração com Airbnb", desc: "Guia digital nativo para Airbnb." },
  { to: "/checkin-com-qr-code", label: "Check-in com QR Code", desc: "Hóspede chega, escaneia, entra." },
  { to: "/manual-digital-pousada", label: "Manual digital de pousada", desc: "Manual online para pousadas." },
  { to: "/manual-digital-para-airbnb", label: "Manual digital para Airbnb", desc: "Substitua o PDF do Airbnb." },
  { to: "/wifi-por-qr-code", label: "Wi-Fi por QR Code", desc: "Senha do Wi-Fi sem digitar." },
  { to: "/central-do-hospede", label: "Central do hóspede", desc: "Tudo da estadia em um lugar." },
  { to: "/check-in-autonomo-airbnb", label: "Check-in autônomo Airbnb", desc: "Self check-in sem encontro." },
  { to: "/como-modernizar-sua-hospedagem", label: "Modernizar sua hospedagem", desc: "Tecnologia para pousadas e flats." },
];

const ALL = [...REQUIRED_LINKS, ...EXTRA_LINKS];

function linksFor(path: string, related: string[]) {
  const ordered = related
    .map((r) => ALL.find((l) => l.to === r))
    .filter((l): l is (typeof ALL)[number] => Boolean(l) && l!.to !== path);
  const extras = REQUIRED_LINKS.filter((l) => l.to !== path && !ordered.includes(l));
  return [...ordered, ...extras].slice(0, 4);
}

export function IntegracaoHostaway() {
  const path = "/integracao-hostaway";
  return (
    <SeoLandingLayout
      path={path}
      title="Integração Hostaway + guia digital com QR Code | Mr Flow"
      description="Conecte sua conta Hostaway ao Mr Flow Welcome Hub e gere guia digital, QR Code e central do hóspede automaticamente para cada reserva."
      eyebrow="Integração Hostaway"
      h1={<>Integração <span style={{ color: "#00FFFF" }}>Hostaway</span> com guia digital automático</>}
      intro={
        <>
          <p>Quem usa Hostaway para gerenciar canais não quer cadastrar imóvel duas vezes. A integração Hostaway do Mr Flow puxa os imóveis da sua conta e cria, para cada um, um guia digital com QR Code pronto para os hóspedes.</p>
          <p>Resultado: a operação continua na Hostaway e a hospitalidade ganha um canal próprio, com sua marca.</p>
        </>
      }
      sections={[
        { title: "O que a integração faz", body: <ul className="list-disc pl-5 space-y-1"><li>Sincroniza imóveis da Hostaway com o Mr Flow</li><li>Gera link público e QR Code por unidade</li><li>Atualiza dados de Wi-Fi, regras e check-in num único lugar</li><li>Mantém o seu PMS como fonte da verdade das reservas</li></ul> },
        { title: "Como funciona", body: <p>Você conecta sua conta Hostaway na tela de integrações, escolhe quais imóveis sincronizar e o Mr Flow cria os guias automaticamente. Personalize uma vez, replique em todos.</p> },
        { title: "Hostaway + QR Code no apartamento", body: <p>Depois da sincronização, imprima o QR Code de cada imóvel e cole no apartamento. O hóspede aponta a câmera e abre o guia direto, sem instalar app. <Link to="/checkin-com-qr-code" className="underline text-cyan-300">Veja o check-in com QR Code</Link>.</p> },
      ]}
      faq={[
        { q: "Preciso recadastrar meus imóveis?", a: "Não. A integração importa os imóveis ativos da sua conta Hostaway automaticamente." },
        { q: "A integração envia o link para o hóspede?", a: "Você pode automatizar o envio pelo próprio fluxo de mensagens da Hostaway ou usar o QR Code no imóvel." },
        { q: "Funciona para várias propriedades?", a: "Sim. A integração foi pensada para portfólios — quanto mais imóveis, mais valor." },
        { q: "Quanto tempo leva para configurar?", a: "Em poucos minutos. Basta conectar a Hostaway e escolher os imóveis a sincronizar." },
      ]}
      internalLinks={linksFor(path, ["/checkin-com-qr-code", "/central-do-hospede", "/app-para-anfitriao", "/hub-de-boas-vindas"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function IntegracaoStays() {
  const path = "/integracao-stays";
  return (
    <SeoLandingLayout
      path={path}
      title="Integração Stays — guia digital e automação | Mr Flow"
      description="Integração Stays com o Mr Flow Welcome Hub: sincronize imóveis, automatize o guia digital do hóspede e reduza mensagens repetidas."
      eyebrow="Integração Stays"
      h1={<>Integração <span style={{ color: "#00FFFF" }}>Stays</span> para automatizar a hospedagem</>}
      intro={
        <>
          <p>A Stays cuida das reservas; o Mr Flow cuida da experiência. Ao integrar Stays + Welcome Hub, cada imóvel ganha um guia digital com sua marca, sem retrabalho operacional.</p>
          <p>É a combinação ideal para quem opera vários imóveis com qualidade hoteleira.</p>
        </>
      }
      sections={[
        { title: "Automação de hospedagem na Stays", body: <p>Configure uma vez o template do Welcome Hub e aplique em todos os imóveis sincronizados pela Stays. Mudou uma regra da casa? Atualiza tudo em segundos.</p> },
        { title: "O que você ganha", body: <ul className="list-disc pl-5 space-y-1"><li>Guia digital padronizado por marca</li><li>QR Code por imóvel pronto para impressão</li><li>Tradução automática PT/EN/ES</li><li>Menos mensagens no WhatsApp e nos canais</li></ul> },
        { title: "Stays + Welcome Hub na prática", body: <p>O hóspede recebe o link da reserva e abre o guia no celular antes de chegar. Ele encontra Wi-Fi, regras, dicas e suporte sem precisar perguntar. <Link to="/central-do-hospede" className="underline text-cyan-300">Veja a central do hóspede</Link>.</p> },
      ]}
      faq={[
        { q: "Funciona com Stays Pro e Stays Enterprise?", a: "Sim. A integração funciona com qualquer plano da Stays que permita acesso à API de propriedades." },
        { q: "Posso usar com outros PMS ao mesmo tempo?", a: "Sim. O Mr Flow é multi-fonte e centraliza a comunicação com o hóspede." },
        { q: "Como personalizar por marca?", a: "Os planos Pro e Business permitem aplicar logo, cores e tipografia próprias em todos os hubs." },
        { q: "Preciso de equipe técnica?", a: "Não. Toda a configuração é feita por uma tela visual de integrações." },
      ]}
      internalLinks={linksFor(path, ["/integracao-hostaway", "/central-do-hospede", "/app-para-anfitriao", "/hub-de-boas-vindas"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function IntegracaoAirbnb() {
  const path = "/integracao-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Integração Airbnb — guia digital e QR Code | Mr Flow"
      description="Crie um guia digital para Airbnb com QR Code e envie no canal de mensagens. Integração leve, sem login do hóspede, sem app para baixar."
      eyebrow="Integração Airbnb"
      h1={<>Integração <span style={{ color: "#00FFFF" }}>Airbnb</span> com guia digital e QR Code</>}
      intro={
        <>
          <p>O Airbnb não oferece um manual digital nativo decente. O Mr Flow Welcome Hub preenche essa lacuna: você cria um guia bonito, envia o link pelo chat da plataforma e cola o QR Code dentro do imóvel.</p>
          <p>Zero atrito para o hóspede, zero retrabalho para o anfitrião.</p>
        </>
      }
      sections={[
        { title: "Por que integrar Airbnb + guia digital", body: <p>Hóspedes do Airbnb chegam com pressa e dúvidas. Um guia digital responde antes da pergunta — e melhora a avaliação. <Link to="/guia-digital-airbnb" className="underline text-cyan-300">Veja o guia digital para Airbnb</Link>.</p> },
        { title: "Como enviar o link", body: <ul className="list-disc pl-5 space-y-1"><li>Mensagem automática de boas-vindas no Airbnb</li><li>Link na descrição do anúncio</li><li>QR Code colado dentro do imóvel</li><li>Mensagem 48h antes do check-in</li></ul> },
        { title: "Airbnb com QR Code", body: <p>O QR Code é o segundo ponto de contato: se o hóspede não abriu o link antes, ele vai abrir ao chegar. Solução simples, efeito instantâneo.</p> },
      ]}
      faq={[
        { q: "Preciso conectar minha conta Airbnb?", a: "Não. Você apenas gera o link do hub e envia pelo chat da plataforma ou usa o QR Code no imóvel." },
        { q: "O Airbnb proíbe links externos?", a: "Não. Links de informação ao hóspede são permitidos no canal de mensagens da reserva." },
        { q: "Funciona para Superhost?", a: "Sim. Superhosts são os que mais ganham com hospitalidade digital — menos mensagens, mais 5 estrelas." },
        { q: "E para Booking, VRBO, aluguel direto?", a: "Funciona igual. O hub é independente da plataforma de reserva." },
      ]}
      internalLinks={linksFor(path, ["/guia-digital-airbnb", "/checkin-com-qr-code", "/manual-digital-para-airbnb", "/hub-de-boas-vindas"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function CheckinComQrCode() {
  const path = "/checkin-com-qr-code";
  return (
    <SeoLandingLayout
      path={path}
      title="Check-in com QR Code para hospedagem | Mr Flow"
      description="Check-in com QR Code: o hóspede escaneia, abre o guia e segue as instruções de chegada no próprio celular. Sem app, sem cadastro."
      eyebrow="Check-in com QR Code"
      h1={<>Check-in com <span style={{ color: "#00FFFF" }}>QR Code</span> para hospedagem</>}
      intro={
        <>
          <p>O check-in com QR Code transforma o adesivo na porta no portal de entrada do seu imóvel. O hóspede aponta a câmera, abre o guia e segue um passo a passo claro de chegada — sem precisar baixar nada.</p>
          <p>Funciona em Airbnb, pousadas, hotéis boutique e flats.</p>
        </>
      }
      sections={[
        { title: "Como funciona o check-in com QR Code", body: <ol className="list-decimal pl-5 space-y-1"><li>Hóspede chega na porta e vê o adesivo</li><li>Aponta a câmera do celular</li><li>Abre o guia digital do imóvel</li><li>Segue o passo a passo com vídeo e fotos</li><li>Em caso de dúvida, aciona o botão de suporte</li></ol> },
        { title: "Vantagens sobre check-in tradicional", body: <ul className="list-disc pl-5 space-y-1"><li>Sem espera por recepcionista</li><li>Sem chave perdida</li><li>Disponível 24h, em qualquer idioma</li><li>Reduz custos operacionais</li></ul> },
        { title: "Onde imprimir o QR Code", body: <p>Na porta de entrada, na geladeira e na mesa de cabeceira. Três pontos de contato cobrem qualquer perfil de hóspede. <Link to="/wifi-por-qr-code" className="underline text-cyan-300">Veja o Wi-Fi por QR Code</Link>.</p> },
      ]}
      faq={[
        { q: "E se o celular do hóspede não ler QR Code?", a: "Todos os celulares modernos (iOS e Android) leem QR Code nativamente pela câmera. Para casos raros, envie também o link pelo WhatsApp." },
        { q: "Posso usar com fechadura inteligente?", a: "Sim. O guia pode instruir o uso da fechadura, mostrar o código e oferecer suporte em vídeo." },
        { q: "O QR Code expira?", a: "Não. Ele aponta para o link do imóvel e funciona enquanto o imóvel estiver ativo." },
        { q: "Funciona com vários idiomas?", a: "Sim. O guia traduz automaticamente para inglês e espanhol." },
      ]}
      internalLinks={linksFor(path, ["/check-in-autonomo-airbnb", "/wifi-por-qr-code", "/integracao-airbnb", "/hub-de-boas-vindas"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ManualDigitalPousada() {
  const path = "/manual-digital-pousada";
  return (
    <SeoLandingLayout
      path={path}
      title="Manual digital de pousada — guia online para hóspedes | Mr Flow"
      description="Manual digital de pousada com regras, horários, café da manhã e dicas locais. Substitua o folder impresso por um guia online sempre atualizado."
      eyebrow="Manual digital de pousada"
      h1={<>Manual digital de <span style={{ color: "#00FFFF" }}>pousada</span> que o hóspede consulta de verdade</>}
      intro={
        <>
          <p>Pousada vive de hospitalidade. E hospitalidade começa com clareza: horário do café, regras da piscina, política de animais, melhores trilhas. Um manual digital de pousada entrega isso no celular do hóspede, em qualquer hora.</p>
          <p>O Mr Flow Welcome Hub é o canal certo para pousadas que querem profissionalizar a comunicação sem perder o charme.</p>
        </>
      }
      sections={[
        { title: "O que entra no manual de pousada", body: <ul className="list-disc pl-5 space-y-1"><li>Boas-vindas com a história da pousada</li><li>Horários: café, recepção, silêncio</li><li>Regras (piscina, pets, crianças, festas)</li><li>Café da manhã: cardápio e dietas</li><li>Trilhas, passeios e parceiros</li><li>Contato direto da recepção</li></ul> },
        { title: "Por que online é melhor que impresso", body: <p>Folder impresso amarela, fica desatualizado e some. Manual online atualiza em segundos e cabe no celular de cada quarto. <Link to="/manual-digital-airbnb" className="underline text-cyan-300">Veja o manual digital para hospedagem</Link>.</p> },
        { title: "Hospitalidade digital em pousadas", body: <p>A geração que reserva pousada hoje espera autonomia e informação rápida. Quem entrega isso ganha avaliações melhores e reserva direta.</p> },
      ]}
      faq={[
        { q: "Funciona para pousada com vários chalés?", a: "Sim. Cada chalé pode ter seu próprio guia, com link e QR Code específicos." },
        { q: "Posso usar a identidade visual da pousada?", a: "Sim. Os planos Pro e Business aplicam logo, cores e tipografia próprias." },
        { q: "E hóspedes estrangeiros?", a: "O guia traduz automaticamente para inglês e espanhol." },
        { q: "Preciso de internet boa no quarto?", a: "O guia é leve e abre rápido até em conexões fracas." },
      ]}
      internalLinks={linksFor(path, ["/como-modernizar-sua-hospedagem", "/central-do-hospede", "/hub-de-boas-vindas", "/wifi-por-qr-code"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ManualDigitalParaAirbnb() {
  const path = "/manual-digital-para-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Manual digital para Airbnb — substitua o PDF | Mr Flow"
      description="Manual digital para Airbnb que substitui o PDF antigo: guia online para hóspedes, atualizável em segundos, com QR Code e tradução."
      eyebrow="Manual digital para Airbnb"
      h1={<>Manual digital para <span style={{ color: "#00FFFF" }}>Airbnb</span> em vez de PDF</>}
      intro={
        <>
          <p>Hóspede não lê PDF de 12 páginas no celular. Ele rola, desiste e te pergunta no chat. Substituir o PDF por um manual digital para Airbnb resolve o problema na raiz.</p>
          <p>O Mr Flow Welcome Hub entrega um guia visual em blocos, com vídeo, foto e botão de copiar.</p>
        </>
      }
      sections={[
        { title: "Por que substituir o PDF do Airbnb", body: <ul className="list-disc pl-5 space-y-1"><li>PDF abre lento no celular</li><li>Não é mobile-first</li><li>Não atualiza sozinho</li><li>Sem tradução</li><li>Sem botão de suporte</li></ul> },
        { title: "Como migrar do PDF para o manual digital", body: <p>Você cola os textos do PDF nos blocos do Mr Flow, organiza por seção e publica. Em 30 minutos seu primeiro guia está no ar. <Link to="/manual-digital-airbnb" className="underline text-cyan-300">Veja o manual digital do Airbnb</Link>.</p> },
        { title: "Manter sempre atualizado", body: <p>Trocou roteador, regra ou eletrodoméstico? Edite um bloco e o próximo hóspede já vê a versão nova — sem reenviar arquivo.</p> },
      ]}
      faq={[
        { q: "Posso importar meu PDF atual?", a: "Você cola o conteúdo nos blocos. Em poucos minutos o manual digital está pronto." },
        { q: "Funciona para vários imóveis?", a: "Sim. Você cria templates e replica em novos imóveis com 1 clique." },
        { q: "Posso oferecer download em PDF também?", a: "Sim. Cada guia pode ser exportado em PDF para hóspedes que prefiram." },
        { q: "É melhor que app nativo?", a: "Para uso de poucos dias, sim. Sem instalação, sem atualização, sem barreira." },
      ]}
      internalLinks={linksFor(path, ["/manual-digital-airbnb", "/integracao-airbnb", "/guia-digital-airbnb", "/hub-de-boas-vindas"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function WifiPorQrCode() {
  const path = "/wifi-por-qr-code";
  return (
    <SeoLandingLayout
      path={path}
      title="Wi-Fi por QR Code para hóspedes | Mr Flow"
      description="Compartilhe o Wi-Fi por QR Code com seus hóspedes: conexão em 1 toque, sem digitar senha, ideal para Airbnb e pousadas."
      eyebrow="Wi-Fi por QR Code"
      h1={<>Wi-Fi por <span style={{ color: "#00FFFF" }}>QR Code</span> sem digitar senha</>}
      intro={
        <>
          <p>"Qual a senha do Wi-Fi?" é a pergunta mais repetida na hospedagem. Um QR Code de Wi-Fi resolve isso: o hóspede aponta a câmera e o celular se conecta sozinho.</p>
          <p>O Mr Flow Welcome Hub entrega um bloco pronto de Wi-Fi com botão de copiar e QR Code embutido.</p>
        </>
      }
      sections={[
        { title: "Como funciona o QR Code de Wi-Fi", body: <p>O QR Code carrega nome da rede, senha e tipo de criptografia. O celular do hóspede lê e conecta automaticamente, sem digitar nada.</p> },
        { title: "Onde colar o QR Code do Wi-Fi", body: <ul className="list-disc pl-5 space-y-1"><li>Geladeira</li><li>Mesa de cabeceira</li><li>Próximo ao roteador</li><li>Dentro do próprio Welcome Hub digital</li></ul> },
        { title: "Wi-Fi em pousadas e flats", body: <p>Em pousadas, imprima o QR Code num cartão na recepção e no quarto. Reduz fila e dúvida. <Link to="/manual-digital-pousada" className="underline text-cyan-300">Veja o manual digital de pousada</Link>.</p> },
      ]}
      faq={[
        { q: "Funciona em iPhone e Android?", a: "Sim. Todos os celulares modernos leem QR Code de Wi-Fi nativamente." },
        { q: "Preciso de roteador especial?", a: "Não. Funciona com qualquer rede Wi-Fi doméstica padrão." },
        { q: "E se a senha mudar?", a: "Você atualiza no Mr Flow e o QR Code dentro do guia atualiza automaticamente." },
        { q: "Posso oferecer rede de visitantes?", a: "Sim. Recomendamos rede separada para hóspedes, com QR Code próprio." },
      ]}
      internalLinks={linksFor(path, ["/checkin-com-qr-code", "/manual-digital-pousada", "/central-do-hospede", "/hub-de-boas-vindas"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function CentralDoHospede() {
  const path = "/central-do-hospede";
  return (
    <SeoLandingLayout
      path={path}
      title="Central do hóspede — informações e suporte 24h | Mr Flow"
      description="Central do hóspede com check-in, Wi-Fi, regras, mapa, dicas locais e suporte em um único link. Funciona como app, sem instalação."
      eyebrow="Central do hóspede"
      h1={<><span style={{ color: "#00FFFF" }}>Central</span> do hóspede em um único link</>}
      intro={
        <>
          <p>A central do hóspede reúne tudo que ele precisa: chegada, Wi-Fi, regras, dicas, suporte. Um link, mobile-first, em qualquer idioma. Sem app para baixar, sem login para fazer.</p>
          <p>É a forma mais moderna de oferecer central de informações em hospedagem.</p>
        </>
      }
      sections={[
        { title: "O que entra na central do hóspede", body: <ul className="list-disc pl-5 space-y-1"><li>Boas-vindas em vídeo</li><li>Check-in passo a passo</li><li>Wi-Fi com botão de copiar</li><li>Mapa de dicas locais</li><li>Regras e check-out</li><li>Botão de suporte com seu contato</li></ul> },
        { title: "Por que centralizar em um app para hóspedes", body: <p>Quando a informação está espalhada (WhatsApp, e-mail, PDF, chat da plataforma), o hóspede pergunta. Centralize tudo em uma URL e o problema some.</p> },
        { title: "Suporte ao hóspede sem atrito", body: <p>O botão de suporte abre o canal que você escolher: WhatsApp, telefone ou chat. <Link to="/como-reduzir-perguntas-no-whatsapp" className="underline text-cyan-300">Veja como reduzir perguntas</Link>.</p> },
      ]}
      faq={[
        { q: "É igual ao app oficial do Airbnb?", a: "Não. O app oficial é da plataforma; a central do hóspede é sua, com seu conteúdo, sua marca e seus contatos." },
        { q: "Funciona offline?", a: "Após o primeiro acesso, o conteúdo essencial fica disponível mesmo em conexão fraca." },
        { q: "Posso ter uma central por imóvel?", a: "Sim. Cada imóvel tem sua própria central, com link e QR Code dedicados." },
        { q: "Posso personalizar com minha marca?", a: "Sim. Logo, cores e tipografia próprias nos planos Pro e Business." },
      ]}
      internalLinks={linksFor(path, ["/hub-de-boas-vindas", "/integracao-hostaway", "/integracao-stays", "/app-para-anfitriao"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function CheckInAutonomoAirbnb() {
  const path = "/check-in-autonomo-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Check-in autônomo Airbnb — self check-in passo a passo | Mr Flow"
      description="Implemente check-in autônomo no Airbnb: self check-in com vídeo, mapa e suporte 24h, sem encontro presencial e sem mensagens repetidas."
      eyebrow="Check-in autônomo Airbnb"
      h1={<>Check-in autônomo no <span style={{ color: "#00FFFF" }}>Airbnb</span> sem encontro presencial</>}
      intro={
        <>
          <p>O self check-in é hoje padrão no Airbnb. Quem ainda depende de encontro presencial perde reservas e gasta tempo. O Mr Flow Welcome Hub entrega o fluxo completo de check-in autônomo em um único link.</p>
          <p>Hóspede chega, abre o link, encontra o caminho. Anfitrião sequer precisa estar online.</p>
        </>
      }
      sections={[
        { title: "Como montar o self check-in no Airbnb", body: <ol className="list-decimal pl-5 space-y-1"><li>Endereço com mapa e ponto de referência</li><li>Vídeo curto da fachada e da entrada</li><li>Como acessar (cofre, código ou fechadura inteligente)</li><li>Wi-Fi com botão de copiar</li><li>Botão de suporte 24h</li></ol> },
        { title: "Automação de check-in", body: <p>Configure mensagem automática no Airbnb 48h antes da chegada com o link do hub. A maioria das dúvidas se resolve antes do hóspede pegar o avião. <Link to="/checkin-com-qr-code" className="underline text-cyan-300">Veja o check-in com QR Code</Link>.</p> },
        { title: "Quando o self check-in dá errado", body: <p>Quase sempre por instrução ambígua. Use fotos da fachada com seta, número do andar grande e vídeo de 15s da fechadura.</p> },
      ]}
      faq={[
        { q: "Preciso de fechadura inteligente?", a: "Não. Você pode indicar onde está a chave (cofre, recepção, porteiro). A fechadura inteligente é opcional." },
        { q: "E se o hóspede chegar de madrugada?", a: "O hub está disponível 24h. Self check-in elimina a barreira de horário." },
        { q: "Funciona para flats e hotéis boutique?", a: "Sim. Qualquer imóvel com check-in autônomo se beneficia do fluxo." },
        { q: "Substitui a recepção física?", a: "Substitui a presença obrigatória. O suporte continua disponível pelo botão do hub." },
      ]}
      internalLinks={linksFor(path, ["/checkin-com-qr-code", "/integracao-airbnb", "/central-do-hospede", "/hub-de-boas-vindas"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ComoModernizarSuaHospedagem() {
  const path = "/como-modernizar-sua-hospedagem";
  return (
    <SeoLandingLayout
      path={path}
      title="Como modernizar sua hospedagem com tecnologia | Mr Flow"
      description="Modernize sua hospedagem com automação, guia digital, QR Code e central do hóspede. Tecnologia para pousadas, flats e Airbnb sem complicação."
      eyebrow="Modernizar sua hospedagem"
      h1={<>Como <span style={{ color: "#00FFFF" }}>modernizar</span> sua hospedagem em 4 passos</>}
      intro={
        <>
          <p>Modernizar hospedagem não significa reformar o imóvel. Significa eliminar atritos da experiência do hóspede com tecnologia certa, leve e barata.</p>
          <p>Veja como pousadas, flats e Airbnbs estão fazendo essa transição com o Mr Flow Welcome Hub.</p>
        </>
      }
      sections={[
        { title: "1. Digitalize o manual e o check-in", body: <p>Substitua folders, PDFs e WhatsApp por um guia digital com QR Code. <Link to="/manual-digital-pousada" className="underline text-cyan-300">Veja o manual digital de pousada</Link>.</p> },
        { title: "2. Automatize a chegada", body: <p>Adote self check-in com vídeo, mapa e suporte 24h. <Link to="/check-in-autonomo-airbnb" className="underline text-cyan-300">Veja o check-in autônomo</Link>.</p> },
        { title: "3. Centralize a comunicação", body: <p>Crie uma central do hóspede com tudo em um link. Menos canais, menos confusão.</p> },
        { title: "4. Integre seu PMS", body: <p>Conecte ferramentas como Hostaway e Stays para automatizar a hospedagem fim a fim — sem cadastrar imóvel duas vezes.</p> },
      ]}
      faq={[
        { q: "Modernizar é caro?", a: "Não. O plano gratuito do Mr Flow cobre 1 imóvel inteiro. Planos pagos começam em valores baixos por unidade." },
        { q: "Preciso de equipe técnica?", a: "Não. Toda a configuração é visual, sem código." },
        { q: "Vale para pousada familiar?", a: "Especialmente. Pousadas familiares competem em hospitalidade — modernizar a experiência amplifica o diferencial." },
        { q: "Tecnologia tira o toque humano?", a: "Pelo contrário. Tira o operacional e libera tempo para o que importa: receber bem." },
      ]}
      internalLinks={linksFor(path, ["/manual-digital-pousada", "/check-in-autonomo-airbnb", "/central-do-hospede", "/integracao-hostaway"])}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ChecklistInspecao5EstrelasAirbnb() {
  const path = "/checklist-inspecao-5-estrelas-airbnb";
  const gammaUrl = "https://checklist-pre-checkin-tqdem3q.gamma.site/";

  const ChecklistMockup = () => (
    <div className="mt-6 p-5 rounded-2xl bg-white/[0.06] border border-cyan-300/20 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(0,255,255,0.25)] max-w-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-300/80">Mr Flow</div>
          <div className="text-sm font-semibold text-white">Checklist 5 Estrelas</div>
        </div>
        <div className="text-[10px] text-white/50">PDF · 9 áreas</div>
      </div>
      <ul className="space-y-2.5 text-sm">
        {[
          "Internet e Wi-Fi",
          "Fechaduras e acessos",
          "Limpeza final",
          "Informações da hospedagem",
          "Itens essenciais do hóspede",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2.5">
            <span className="h-5 w-5 rounded-md bg-cyan-400/15 border border-cyan-300/40 flex items-center justify-center text-cyan-300 text-xs">✓</span>
            <span className="text-white/85">{item}</span>
          </li>
        ))}
        <li className="flex items-center gap-2.5 opacity-60">
          <span className="h-5 w-5 rounded-md bg-white/5 border border-white/15" />
          <span className="text-white/50 text-xs">+ 4 áreas adicionais no PDF…</span>
        </li>
      </ul>
    </div>
  );

  return (
    <SeoLandingLayout
      path={path}
      title="Checklist Gratuito de Inspeção 5 Estrelas para Airbnb | Mr Flow Welcome Hub"
      description="Baixe gratuitamente o checklist de inspeção utilizado por anfitriões profissionais para evitar avaliações negativas e oferecer uma experiência 5 estrelas aos hóspedes."
      eyebrow="Checklist gratuito"
      h1={<>Checklist Gratuito de Inspeção <span style={{ color: "#00FF00" }}>5 Estrelas</span> para Airbnb</>}
      intro={
        <>
          <p>Descubra os principais itens que anfitriões profissionais verificam antes do check-in para evitar reclamações, melhorar avaliações e proporcionar uma experiência impecável aos hóspedes.</p>
          <p className="text-white/70 text-sm">Material em PDF, gratuito, sem cadastro — pronto para imprimir e usar na próxima reserva.</p>
          <ChecklistMockup />
        </>
      }
      ctaPrimary="Baixar Checklist Gratuitamente"
      ctaHref={gammaUrl}
      sections={[
        {
          title: "Por que avaliações negativas acontecem?",
          body: (
            <>
              <p>A maioria das avaliações abaixo de 5 estrelas não vem do imóvel em si — vem de detalhes operacionais que poderiam ser evitados com uma inspeção consistente antes da chegada do hóspede.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {[
                  { t: "Problemas com Wi-Fi", d: "Senha errada, sinal fraco ou roteador desligado." },
                  { t: "Limpeza insuficiente", d: "Detalhes esquecidos que parecem amadorismo." },
                  { t: "Falta de informações", d: "Hóspede sem saber como ligar o ar, abrir o portão ou usar a TV." },
                  { t: "Check-in confuso", d: "Endereço errado, chave que não funciona, instruções ambíguas." },
                  { t: "Falhas de comunicação", d: "Respostas demoradas e perguntas que se repetem toda reserva." },
                ].map((c) => (
                  <div key={c.t} className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="font-semibold text-white mb-1">{c.t}</div>
                    <div className="text-sm text-white/70">{c.d}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl bg-cyan-500/10 border border-cyan-300/20 text-sm">
                <span className="font-semibold text-cyan-300">+70%</span>{" "}
                <span className="text-white/80">das reclamações em plataformas de hospedagem estão ligadas a Wi-Fi, limpeza e falta de informações claras.</span>
              </div>
            </>
          ),
        },
        {
          title: "O que você encontrará neste checklist",
          body: (
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {[
                "Internet e Wi-Fi",
                "Fechaduras e acessos",
                "Limpeza final",
                "Informações da hospedagem",
                "Regras da casa",
                "Itens essenciais do hóspede",
                "Recomendações locais",
                "Segurança",
                "Comunicação pré check-in",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.04] border border-white/10">
                  <span className="h-5 w-5 rounded-md bg-cyan-400/15 border border-cyan-300/40 flex items-center justify-center text-cyan-300 text-xs shrink-0">✓</span>
                  <span className="text-white/90 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          ),
        },
        {
          title: "Ideal para",
          body: (
            <div className="grid sm:grid-cols-3 gap-3">
              {["Airbnb", "Booking.com", "Casas de temporada", "Pousadas", "Flats", "Imóveis administrados"].map((p) => (
                <div key={p} className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                  <div className="font-semibold text-white">{p}</div>
                </div>
              ))}
            </div>
          ),
        },
        {
          title: "Conheça o Mr Flow Welcome Hub",
          body: (
            <>
              <p>Este checklist faz parte da metodologia usada pelo <strong className="text-white">Mr Flow Welcome Hub</strong> — a plataforma que transforma a hospitalidade digital de anfitriões profissionais em um padrão consistente, propriedade após propriedade.</p>
              <div className="grid sm:grid-cols-2 gap-2.5 mt-4">
                {[
                  "Guia Digital do hóspede",
                  "QR Code para hóspedes",
                  "Check-in digital",
                  "Wi-Fi centralizado",
                  "Regras da casa",
                  "Recomendações locais",
                  "Avaliações",
                ].map((r) => (
                  <div key={r} className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.04] border border-white/10">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#00FFFF" }} />
                    <span className="text-white/85 text-sm">{r}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold transition-colors">
                  Conhecer o Welcome Hub →
                </Link>
              </div>
            </>
          ),
        },
      ]}
      faq={[
        { q: "O checklist é gratuito?", a: "Sim, 100% gratuito. Você baixa em PDF, sem cadastro, e pode imprimir ou usar no celular durante a inspeção." },
        { q: "Serve para Airbnb?", a: "Sim. O checklist foi desenhado a partir das principais causas de avaliações abaixo de 5 estrelas no Airbnb e cobre todos os pontos que o hóspede observa nas primeiras horas." },
        { q: "Funciona para pousadas?", a: "Funciona. Os mesmos princípios de hospitalidade se aplicam a pousadas, flats e casas de temporada — apenas adapte a lista de itens essenciais ao seu padrão." },
        { q: "Como melhorar avaliações dos hóspedes?", a: "Padronize a inspeção antes de cada check-in, antecipe dúvidas com um guia digital e responda rapidamente nas primeiras horas. O checklist cobre os 9 pontos com maior impacto na nota final." },
        { q: "O que verificar antes do check-in?", a: "Wi-Fi funcionando, fechaduras/acessos testados, limpeza revisada, informações da hospedagem disponíveis, regras da casa visíveis e itens essenciais repostos. O PDF detalha cada item." },
        { q: "Como evitar reclamações dos hóspedes?", a: "Reclamações vêm quase sempre de surpresas. Inspecione com checklist, ofereça um guia digital com tudo que o hóspede precisa saber e mantenha o canal de comunicação aberto desde a reserva." },
      ]}
      internalLinks={[
        { to: "/guia-digital-airbnb", label: "Guia digital para Airbnb", desc: "Tudo que o hóspede precisa, em um link." },
        { to: "/manual-digital-airbnb", label: "Manual digital do Airbnb", desc: "Substitua o caderno impresso." },
        { to: "/guest-app-airbnb", label: "Guest app para Airbnb", desc: "PWA sem download obrigatório." },
        { to: "/guia-do-hospede", label: "Guia do hóspede", desc: "Modelo pronto, comprovado." },
        { to: "/hub-de-boas-vindas", label: "Hub de Boas Vindas", desc: "A primeira impressão digital do imóvel." },
      ]}
      datePublished="2026-05-29"
      dateModified="2026-05-29"
    />
  );
}
