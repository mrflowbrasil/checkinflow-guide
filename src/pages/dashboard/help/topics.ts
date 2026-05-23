export type HelpSection = {
  heading?: string;
  body: string[];
  tip?: string;
  steps?: string[];
};

export type HelpTopic = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  sections: HelpSection[];
};

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "criar-imovel",
    title: "Criando seu primeiro imóvel",
    description: "Como cadastrar uma nova propriedade na plataforma.",
    keywords: ["imóvel", "propriedade", "novo", "criar", "cadastrar"],
    sections: [
      {
        heading: "Passo a passo",
        body: [
          "Você pode criar quantos imóveis seu plano permitir. Cada imóvel tem seu próprio guia digital e QR Code.",
        ],
        steps: [
          "No menu lateral, clique em Imóveis.",
          "Clique no botão Novo imóvel no canto superior direito.",
          "Preencha o nome do imóvel (esse será o título exibido aos hóspedes).",
          "Escolha um template inicial ou comece do zero.",
          "Clique em Criar imóvel para salvar.",
        ],
      },
      {
        tip: "O nome pode ser alterado depois nas configurações do imóvel.",
        body: [],
      },
    ],
  },
  {
    id: "imagem-capa",
    title: "Imagem de capa",
    description: "Defina a imagem principal que abre o guia do hóspede.",
    keywords: ["capa", "imagem", "foto", "banner", "upload"],
    sections: [
      {
        body: [
          "A imagem de capa aparece no topo do guia público, logo após o hóspede abrir o link ou escanear o QR Code.",
        ],
        steps: [
          "Acesse o imóvel desejado em Imóveis.",
          "Clique na área da capa (ou no botão Alterar capa).",
          "Selecione uma imagem do seu computador.",
          "Aguarde o upload concluir — a pré-visualização atualiza automaticamente.",
        ],
      },
      {
        heading: "Recomendações",
        body: [
          "Formatos aceitos: JPG, PNG e WEBP.",
          "Proporção recomendada: 16:9 (paisagem).",
          "Tamanho mínimo: 1200x675 pixels para boa nitidez em telas grandes.",
        ],
        tip: "Evite imagens com texto embutido — o título do imóvel já aparece sobre a capa.",
      },
    ],
  },
  {
    id: "campos-imovel",
    title: "Informações do imóvel",
    description: "Título, descrição, link público e demais campos.",
    keywords: ["título", "descrição", "link", "slug", "url"],
    sections: [
      {
        body: [
          "Cada imóvel tem campos que aparecem para o hóspede e ajudam a personalizar o guia.",
        ],
      },
      {
        heading: "Campos disponíveis",
        body: [
          "Título: nome exibido em destaque na capa do guia.",
          "Descrição curta: subtítulo opcional logo abaixo do título.",
          "Link público: URL única (ex.: hub.mrflow.com.br/g/seu-imovel) que você compartilha com o hóspede.",
          "Slug: parte final do link — pode ser personalizado nas configurações do imóvel.",
        ],
        tip: "Trocar o slug invalida o link e o QR Code antigos. Reimprima o QR após alterar.",
      },
    ],
  },
  {
    id: "ativar-paginas",
    title: "Ativar e desativar páginas do guia",
    description: "Controle quais seções aparecem para o hóspede.",
    keywords: ["páginas", "ativar", "desativar", "ocultar", "publicar"],
    sections: [
      {
        body: [
          "Cada imóvel tem várias páginas (Boas-vindas, Check-in, Wi-Fi, Regras, etc.). Você decide quais ficam visíveis.",
        ],
        steps: [
          "Abra o imóvel e veja a lista de páginas.",
          "Use o interruptor (toggle) ao lado de cada página para ativar ou desativar.",
          "Páginas desativadas ficam ocultas no guia público — o hóspede não as vê.",
        ],
        tip: "Você pode editar uma página mesmo desativada e ativá-la quando estiver pronta.",
      },
    ],
  },
  {
    id: "reordenar",
    title: "Reordenar blocos e páginas",
    description: "Arraste para mudar a ordem de exibição.",
    keywords: ["arrastar", "reordenar", "ordem", "drag"],
    sections: [
      {
        body: [
          "Tanto as páginas do guia quanto os blocos dentro do editor podem ser reordenados com arrastar e soltar.",
        ],
        steps: [
          "Clique e segure o ícone de alça (≡) ao lado do item.",
          "Arraste para cima ou para baixo até a posição desejada.",
          "Solte — a nova ordem é salva automaticamente.",
        ],
        tip: "No celular, toque e segure por um instante antes de arrastar.",
      },
    ],
  },
  {
    id: "blocos-editor",
    title: "Blocos do editor de guias",
    description: "Conheça cada tipo de bloco disponível.",
    keywords: ["blocos", "editor", "texto", "imagem", "vídeo", "botão", "lista", "senha"],
    sections: [
      {
        body: [
          "Dentro de cada página, você monta o conteúdo combinando blocos. Clique em Adicionar bloco para escolher o tipo.",
        ],
      },
      {
        heading: "Texto",
        body: ["Parágrafo padrão para instruções, recados e descrições. Suporta quebras de linha."],
      },
      {
        heading: "Subtítulo",
        body: ["Título de seção dentro da página. Use para separar assuntos (ex.: 'Como chegar', 'Regras')."],
      },
      {
        heading: "Imagem",
        body: ["Suba uma foto (JPG/PNG/WEBP). Útil para mostrar entrada, eletrodomésticos ou pontos de referência."],
      },
      {
        heading: "Vídeo",
        body: ["Suba um vídeo curto ou cole um link do YouTube/Vimeo. Ideal para tutoriais de fechadura, ar-condicionado, etc."],
      },
      {
        heading: "Passo a passo",
        body: ["Lista numerada com passos sequenciais. Cada passo pode ter título e descrição."],
      },
      {
        heading: "Caixa de dica",
        body: ["Destaque visual para alertas, dicas ou avisos importantes (ex.: 'Não jogue papel no vaso')."],
      },
      {
        heading: "Botão",
        body: ["Botão clicável com link externo. Bom para WhatsApp, Maps, cardápio, etc."],
      },
      {
        heading: "Lista",
        body: ["Lista de itens com marcadores. Útil para itens inclusos, regras curtas ou checklist."],
      },
      {
        heading: "Senha",
        body: ["Campo especial para Wi-Fi ou código de fechadura, com botão de copiar para o hóspede."],
      },
      {
        heading: "Linha divisória",
        body: ["Separador visual entre seções da página."],
      },
    ],
  },
  {
    id: "copiar-blocos",
    title: "Copiar e colar blocos entre páginas",
    description: "Reaproveite conteúdo de uma página em outra.",
    keywords: ["copiar", "colar", "duplicar", "blocos"],
    sections: [
      {
        steps: [
          "No editor, clique no menu (⋯) do bloco que deseja copiar.",
          "Escolha Copiar bloco.",
          "Vá até a página de destino (mesmo imóvel ou outro).",
          "Clique em Colar bloco no local desejado.",
        ],
        body: [
          "Os blocos copiados ficam disponíveis enquanto você navega entre páginas. Imagens e vídeos são reaproveitados sem novo upload.",
        ],
      },
    ],
  },
  {
    id: "qr-code",
    title: "Gerar um novo QR Code",
    description: "Quando regerar e o que acontece com o QR antigo.",
    keywords: ["qr code", "qrcode", "link", "regerar", "imprimir"],
    sections: [
      {
        body: [
          "O QR Code aponta para o link público do imóvel. Cada imóvel tem o seu, gerado automaticamente.",
        ],
        steps: [
          "Acesse o imóvel e abra a aba QR Code.",
          "Clique em Baixar QR Code para salvar em PNG/PDF.",
          "Para gerar um novo, clique em Gerar novo QR Code.",
        ],
      },
      {
        heading: "Atenção ao regerar",
        body: [
          "Ao gerar um novo QR Code, o link antigo é revogado. Materiais impressos com o QR anterior deixam de funcionar.",
          "Use essa função se precisar invalidar acesso (ex.: após troca de hóspedes problemáticos) ou se o slug do imóvel foi alterado.",
        ],
        tip: "Sempre reimprima e substitua todos os QR Codes físicos após regerar.",
      },
    ],
  },
  {
    id: "templates",
    title: "Usar templates prontos",
    description: "Comece com um modelo pré-formatado.",
    keywords: ["templates", "modelos", "tema", "design"],
    sections: [
      {
        body: [
          "Templates são modelos visuais com páginas e blocos já estruturados. Você só precisa preencher com as informações do seu imóvel.",
        ],
        steps: [
          "Acesse Templates no menu lateral.",
          "Navegue pelas opções e clique em um template para pré-visualizar.",
          "Clique em Usar este template ao criar um novo imóvel.",
          "Depois é só personalizar texto, imagens e cores.",
        ],
        tip: "Você pode trocar de template a qualquer momento, mas o conteúdo já editado pode precisar de ajustes.",
      },
    ],
  },
  {
    id: "duplicar-propriedade",
    title: "Duplicar uma propriedade",
    description: "Crie uma cópia completa de um imóvel existente.",
    keywords: ["duplicar", "copiar", "clonar", "imóvel"],
    sections: [
      {
        body: [
          "Se você tem vários imóveis parecidos, duplicar economiza muito tempo. A cópia traz todas as páginas, blocos, imagens e configurações.",
        ],
        steps: [
          "Em Imóveis, localize a propriedade que deseja duplicar.",
          "Clique no menu (⋯) e escolha Duplicar.",
          "Dê um novo nome ao imóvel duplicado.",
          "Confirme — o novo imóvel aparece na lista com um link e QR Code próprios.",
        ],
      },
      {
        heading: "O que ajustar depois",
        body: [
          "Endereço e instruções de chegada específicas do novo imóvel.",
          "Senha do Wi-Fi e códigos de fechadura.",
          "Imagem de capa e fotos internas.",
        ],
      },
    ],
  },
];
