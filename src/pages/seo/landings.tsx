import { SeoLandingLayout } from "@/components/seo/SeoLandingLayout";

const ALL_LINKS = [
  { to: "/guia-digital-airbnb", label: "Guia digital para Airbnb", desc: "Tudo que o hóspede precisa saber, em um link." },
  { to: "/manual-digital-airbnb", label: "Manual digital do Airbnb", desc: "Substitua aquele caderno impresso de instruções." },
  { to: "/app-para-anfitriao", label: "App para anfitrião", desc: "Gerencie seus imóveis e guias em um só lugar." },
  { to: "/hub-de-boas-vindas", label: "Hub de Boas Vindas", desc: "A primeira impressão digital do seu imóvel." },
  { to: "/guest-app-airbnb", label: "Guest app para Airbnb", desc: "Aplicativo do hóspede sem precisar baixar nada." },
  { to: "/guia-do-hospede", label: "Guia do hóspede", desc: "Boas-vindas, dicas locais e regras da casa." },
];

function linksExcept(path: string) {
  return ALL_LINKS.filter((l) => l.to !== path).slice(0, 4);
}

export function GuiaDigitalAirbnb() {
  const path = "/guia-digital-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Guia digital para Airbnb — crie em minutos | Mr Flow"
      description="Crie um guia digital para seu Airbnb com check-in, Wi-Fi, regras e dicas locais. Link único, QR Code e leitura no celular do hóspede."
      eyebrow="Guia digital para Airbnb"
      h1={<>Guia digital para <span style={{ color: "#00FFFF" }}>Airbnb</span> sem complicação</>}
      intro={
        <>
          <p>Pare de responder as mesmas perguntas todos os dias. Com o Mr Flow Welcome Hub, você cria um guia digital para o seu Airbnb e envia um link único para cada hóspede — funciona como um mini-site, abre direto no navegador e não exige instalação.</p>
          <p>Inclua check-in, senha do Wi-Fi, regras da casa, dicas de restaurantes e contatos de emergência. Tudo organizado, traduzido e disponível 24h.</p>
        </>
      }
      sections={[
        { title: "Por que ter um guia digital para Airbnb", body: <p>Hóspedes esperam autonomia. Um guia digital reduz mensagens, melhora avaliações e dá uma experiência profissional mesmo em imóveis pequenos. Você ganha tempo e o hóspede ganha conforto.</p> },
        { title: "O que entra no guia", body: <ul className="list-disc pl-5 space-y-1"><li>Instruções de check-in e check-out</li><li>Wi-Fi com botão de copiar</li><li>Manual de eletrodomésticos e ar-condicionado</li><li>Regras da casa em texto claro</li><li>Dicas de bairro: cafés, mercados, transporte</li><li>Contatos de emergência e suporte</li></ul> },
        { title: "Como funciona na prática", body: <p>Você cadastra o imóvel, escolhe um template e edita os blocos por arrastar e soltar. Recebe um link e um QR Code para imprimir e deixar dentro do apartamento. O hóspede acessa pelo celular, sem baixar nada.</p> },
      ]}
      faq={[
        { q: "Preciso pagar para criar um guia digital?", a: "Não. O plano Starter é gratuito e permite criar seu primeiro guia digital com todas as seções essenciais." },
        { q: "O hóspede precisa instalar um aplicativo?", a: "Não. O guia abre direto no navegador do celular, mas pode ser adicionado à tela inicial como um app (PWA)." },
        { q: "Posso traduzir o guia automaticamente?", a: "Sim. O Mr Flow Welcome Hub traduz o conteúdo para português, inglês e espanhol em tempo real." },
        { q: "Funciona para outras plataformas além do Airbnb?", a: "Sim. Funciona para Booking, VRBO, aluguel direto e qualquer reserva — basta enviar o link." },
      ]}
      internalLinks={linksExcept(path)}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function ManualDigitalAirbnb() {
  const path = "/manual-digital-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Manual digital do Airbnb — substitua o impresso | Mr Flow"
      description="Crie um manual digital do Airbnb com instruções claras de eletrodomésticos, Wi-Fi, regras e check-out. Sempre atualizado, no celular do hóspede."
      eyebrow="Manual digital do Airbnb"
      h1={<>Manual digital do <span style={{ color: "#00FFFF" }}>Airbnb</span> que ninguém perde</>}
      intro={
        <>
          <p>Aquele caderno impresso na mesa da sala envelhece rápido: a TV troca, o Wi-Fi muda, o Airbnb proíbe um item. Um manual digital do Airbnb é editável a qualquer hora e fica sempre atualizado para o próximo hóspede.</p>
          <p>O Mr Flow Welcome Hub gera um manual organizado, com seções por cômodo e instruções passo a passo com fotos.</p>
        </>
      }
      sections={[
        { title: "Diferença entre guia e manual digital", body: <p>O guia inclui dicas e boas-vindas; o manual foca em <strong>instruções operacionais</strong>: como ligar o aquecedor, programar o ar-condicionado, usar a máquina de lavar ou fazer o check-out correto.</p> },
        { title: "Estrutura recomendada", body: <ul className="list-disc pl-5 space-y-1"><li>Wi-Fi e TV (com print do controle)</li><li>Eletrodomésticos da cozinha</li><li>Ar-condicionado e aquecimento</li><li>Coleta de lixo e reciclagem</li><li>Check-out passo a passo</li><li>Problemas comuns e suporte</li></ul> },
        { title: "Atualizações em segundos", body: <p>Trocou o roteador? Edite o bloco do Wi-Fi e o próximo hóspede já vê a senha nova. Sem reimprimir, sem reimpressão, sem retrabalho.</p> },
      ]}
      faq={[
        { q: "Posso adicionar fotos no manual?", a: "Sim. Cada bloco aceita imagens, vídeos e instruções passo a passo com numeração automática." },
        { q: "O manual funciona offline?", a: "O conteúdo é leve e abre rápido em qualquer conexão. Se o hóspede instalar como app, fica disponível depois do primeiro acesso." },
        { q: "Quantos imóveis posso cadastrar?", a: "Depende do plano. O Starter inclui 1 imóvel; o Pro e o Business escalam por imóvel a partir de R$ 3,32." },
        { q: "Posso clonar o manual entre imóveis parecidos?", a: "Sim. É possível duplicar páginas e blocos para acelerar a criação de manuais em portfólios maiores." },
      ]}
      internalLinks={linksExcept(path)}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function AppParaAnfitriao() {
  const path = "/app-para-anfitriao";
  return (
    <SeoLandingLayout
      path={path}
      title="App para anfitrião de Airbnb — gestão de imóveis | Mr Flow"
      description="App para anfitrião gerenciar imóveis, guias digitais, links de check-in e mensagens. Centralize tudo no Mr Flow Welcome Hub."
      eyebrow="App para anfitrião"
      h1={<>O app que todo <span style={{ color: "#00FFFF" }}>anfitrião</span> precisava</>}
      intro={
        <>
          <p>Anfitrião profissional não vive mais de planilha e WhatsApp. O Mr Flow Welcome Hub é o app para anfitrião que centraliza imóveis, guias, mensagens recorrentes e links públicos em um único painel.</p>
          <p>Funciona no navegador do computador e do celular — sem download obrigatório.</p>
        </>
      }
      sections={[
        { title: "O que você gerencia", body: <ul className="list-disc pl-5 space-y-1"><li>Cadastro de imóveis com capa, endereço e link de reserva</li><li>Guias digitais por imóvel, com páginas e blocos</li><li>QR Code automático para imprimir e deixar no quarto</li><li>Templates prontos para criar o próximo imóvel em minutos</li><li>Branding do anfitrião: logo e cores próprias</li></ul> },
        { title: "Para quem é", body: <p>Anfitriões com 1 imóvel que querem profissionalizar a operação, e gestores com 10, 50 ou 200 unidades que precisam padronizar a experiência sem perder a identidade de cada propriedade.</p> },
        { title: "Integrações", body: <p>O app conversa com plataformas de reservas e ferramentas de automação. Conecte sua stack atual e mantenha o Mr Flow como camada de comunicação com o hóspede.</p> },
      ]}
      faq={[
        { q: "Preciso baixar o app na App Store?", a: "Não. O Mr Flow Welcome Hub é um app web que abre no navegador. Você pode instalá-lo como PWA na tela inicial." },
        { q: "Funciona para gestor com vários imóveis?", a: "Sim. Os planos Pro e Business são feitos para gestores, com preço por imóvel e templates reutilizáveis." },
        { q: "Tem aplicativo para o hóspede também?", a: "Sim. O hóspede recebe um link único que funciona como um app — sem instalação obrigatória." },
        { q: "Existe versão para iOS e Android?", a: "O app web funciona em qualquer sistema. Para o anfitrião e para o hóspede, basta abrir o link no celular." },
      ]}
      internalLinks={linksExcept(path)}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function HubDeBoasVindas() {
  const path = "/hub-de-boas-vindas";
  return (
    <SeoLandingLayout
      path={path}
      title="Hub de Boas Vindas digital para hospedagem | Mr Flow"
      description="Crie um Hub de Boas Vindas digital com identidade própria. Receba o hóspede com check-in, dicas locais e suporte direto no celular."
      eyebrow="Hub de Boas Vindas"
      h1={<>Hub de Boas Vindas: a <span style={{ color: "#00FFFF" }}>primeira impressão</span> digital</>}
      intro={
        <>
          <p>A hospedagem começa antes do hóspede chegar. O Hub de Boas Vindas reúne em uma única tela tudo que ele precisa para se sentir em casa: instruções, vídeo de boas-vindas, regras, dicas e contato.</p>
          <p>É a sua marca, sua identidade visual e a sua hospitalidade em formato digital.</p>
        </>
      }
      sections={[
        { title: "Mais que um manual: uma experiência", body: <p>O Hub de Boas Vindas combina design, conteúdo e suporte. Cada imóvel ganha um link bonito, adaptado ao celular, com a sua paleta de cores e logo no topo.</p> },
        { title: "Benefícios para o anfitrião", body: <ul className="list-disc pl-5 space-y-1"><li>Menos mensagens repetidas no WhatsApp</li><li>Avaliações 5 estrelas com mais frequência</li><li>Padronização entre imóveis sem perder a personalidade</li><li>Diferencial competitivo claro nos anúncios</li></ul> },
        { title: "Templates prontos", body: <p>Escolha entre templates Clean, Dark e Luxury. Personalize cores, fontes e ordem dos blocos. Pronto para enviar em poucos cliques.</p> },
      ]}
      faq={[
        { q: "Posso usar minha logo e minhas cores?", a: "Sim. Os planos Pro e Business permitem aplicar logo e paleta de cores próprias em todos os hubs." },
        { q: "Preciso saber programar?", a: "Não. O editor é visual: arraste, solte, escreva e publique." },
        { q: "Tenho um modelo padrão para todos os imóveis?", a: "Sim. Você cria templates internos e replica em novos imóveis com 1 clique." },
        { q: "O hub é responsivo?", a: "É mobile-first. Foi desenhado primeiro para o celular do hóspede, com botões grandes e leitura confortável." },
      ]}
      internalLinks={linksExcept(path)}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function GuestAppAirbnb() {
  const path = "/guest-app-airbnb";
  return (
    <SeoLandingLayout
      path={path}
      title="Guest app para Airbnb sem instalação | Mr Flow"
      description="Guest app para Airbnb que abre no navegador do hóspede. Sem download obrigatório, com check-in, regras e suporte em um link."
      eyebrow="Guest app para Airbnb"
      h1={<><span style={{ color: "#00FFFF" }}>Guest app</span> para Airbnb sem instalação obrigatória</>}
      intro={
        <>
          <p>A maioria dos hóspedes não baixa apps de aluguel de temporada. O Mr Flow resolve isso com um guest app PWA: ele abre direto no navegador e, se o hóspede quiser, vira um ícone na tela inicial.</p>
          <p>Resultado: 100% de adoção e zero atrito.</p>
        </>
      }
      sections={[
        { title: "Por que PWA é melhor que app nativo", body: <p>App nativo exige instalação, atualização e aprovação em loja. PWA abre no link, é leve e atualiza sozinho. Para uso pontual de poucos dias, é a escolha certa.</p> },
        { title: "Funcionalidades do guest app", body: <ul className="list-disc pl-5 space-y-1"><li>Check-in interativo com fotos e vídeo</li><li>Wi-Fi com botão de copiar</li><li>Mapa e dicas locais</li><li>Botão de emergência</li><li>Tradução automática para PT, EN e ES</li></ul> },
        { title: "Como o hóspede recebe", body: <p>Você envia o link no app de mensagens da plataforma ou no WhatsApp, e ele clica. Pronto. Pode também ler o QR Code colado no apartamento.</p> },
      ]}
      faq={[
        { q: "Funciona em iPhone e Android?", a: "Sim. Funciona em qualquer celular com navegador moderno (Safari, Chrome, etc.)." },
        { q: "O hóspede consegue voltar depois?", a: "Sim. Com 1 toque, ele instala o atalho na tela inicial e o guest app fica acessível como qualquer app." },
        { q: "Precisa de cadastro do hóspede?", a: "Não. O acesso é via link público e sem login, removendo qualquer fricção." },
        { q: "É seguro abrir links públicos?", a: "Sim. O conteúdo é controlado por você e o link pode ser desativado a qualquer momento." },
      ]}
      internalLinks={linksExcept(path)}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}

export function GuiaDoHospede() {
  const path = "/guia-do-hospede";
  return (
    <SeoLandingLayout
      path={path}
      title="Guia do hóspede para temporada — modelo pronto | Mr Flow"
      description="Modelo pronto de guia do hóspede para aluguel por temporada. Boas-vindas, regras, dicas locais e contato de emergência em um link."
      eyebrow="Guia do hóspede"
      h1={<>Guia do <span style={{ color: "#00FFFF" }}>hóspede</span> que encanta na chegada</>}
      intro={
        <>
          <p>O guia do hóspede é o documento que define a experiência do aluguel por temporada. Bem feito, ele economiza horas de mensagens e gera avaliações 5 estrelas. Mal feito, vira uma caixa de e-mails caótica.</p>
          <p>O Mr Flow Welcome Hub entrega o modelo pronto e a estrutura comprovada para criar o seu em minutos.</p>
        </>
      }
      sections={[
        { title: "Estrutura ideal de um guia do hóspede", body: <ol className="list-decimal pl-5 space-y-1"><li>Mensagem de boas-vindas com nome e foto</li><li>Check-in: endereço, chegada e acesso</li><li>Wi-Fi e mídias da casa</li><li>Regras e combinados</li><li>Dicas de bairro e restaurantes</li><li>Procedimentos de check-out</li><li>Emergência e suporte</li></ol> },
        { title: "Boas práticas", body: <p>Use linguagem simples, fotos reais do imóvel e pelo menos um vídeo curto explicando a chegada. Evite blocos longos de texto — divida em seções com ícones grandes.</p> },
        { title: "Dicas locais que valem ouro", body: <p>Liste 3 cafés, 3 restaurantes, 2 mercados, 1 farmácia e a melhor opção de transporte. Esse mini-roteiro é o que mais aparece nos comentários positivos.</p> },
      ]}
      faq={[
        { q: "Tem um template pronto que eu possa usar?", a: "Sim. O Mr Flow inclui templates preenchidos para acelerar o seu primeiro guia do hóspede." },
        { q: "Em quais idiomas o guia funciona?", a: "Português, inglês e espanhol com tradução automática contextual." },
        { q: "Posso enviar o mesmo guia para todos os hóspedes?", a: "Sim. O link público fica ativo enquanto o imóvel estiver ativo. Você compartilha sempre o mesmo URL." },
        { q: "Funciona com Booking, VRBO e aluguel direto?", a: "Sim. O guia é independente da plataforma de reserva e pode ser usado em qualquer canal." },
      ]}
      internalLinks={linksExcept(path)}
      datePublished="2026-01-15"
      dateModified="2026-05-29"
    />
  );
}
