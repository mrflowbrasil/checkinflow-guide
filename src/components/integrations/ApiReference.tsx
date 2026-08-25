import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Code2, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Param = { name: string; in: "query" | "header" | "body"; type: string; required?: boolean; description: string };
type Endpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  title: string;
  description: string;
  auth: string;
  params?: Param[];
  requestExample?: string;
  responseExample: string;
};

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/properties-api",
    title: "Listar imóveis",
    description: "Retorna os imóveis do workspace com filtros opcionais. Paginação via limit/offset.",
    auth: "X-API-Key",
    params: [
      { name: "external_id", in: "query", type: "string", description: "Filtrar pelo ID externo (do PMS)." },
      { name: "external_provider", in: "query", type: "string", description: "Filtrar por provedor (stays, hostaway)." },
      { name: "status", in: "query", type: "string", description: "active | inactive." },
      { name: "created_from", in: "query", type: "ISO date", description: "Data inicial de criação." },
      { name: "created_to", in: "query", type: "ISO date", description: "Data final de criação." },
      { name: "search", in: "query", type: "string", description: "Busca por nome (ilike)." },
      { name: "limit", in: "query", type: "number", description: "1–500 (padrão 100)." },
      { name: "offset", in: "query", type: "number", description: "Padrão 0." },
    ],
    responseExample: `{
  "total": 12,
  "count": 12,
  "limit": 100,
  "offset": 0,
  "items": [
    {
      "id": "uuid",
      "name": "Apto 101",
      "external_id": "stays-123",
      "external_provider": "stays",
      "status": "active",
      "address": "Rua X, 100",
      "cover_image_url": "https://...",
      "public_slug": "apto-101-ab12",
      "public_url": "https://hub.mrflow.com.br/g/apto-101-ab12",
      "created_at": "2026-01-01T12:00:00Z"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/properties-api/pages-catalog",
    title: "Catálogo de páginas",
    description: "Lista todas as page_keys padrão disponíveis no guia (não consulta o banco).",
    auth: "X-API-Key",
    responseExample: `{
  "count": 23,
  "items": [
    { "page_key": "checkin", "title": "Check-in", "icon": "Clock", "default_position": 1 },
    { "page_key": "wifi", "title": "Wi-Fi", "icon": "Wifi", "default_position": 4 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/properties-api/pages",
    title: "Páginas de um imóvel",
    description: "Retorna as páginas (e estado de ativação) de um imóvel específico identificado pelo ID externo.",
    auth: "X-API-Key",
    params: [
      { name: "external_id", in: "query", type: "string", required: true, description: "ID do imóvel no PMS." },
      { name: "external_provider", in: "query", type: "string", description: "Padrão: stays." },
    ],
    responseExample: `{
  "property_id": "uuid",
  "external_id": "stays-123",
  "external_provider": "stays",
  "count": 23,
  "items": [
    { "id": "uuid", "page_key": "checkin", "title": "Check-in", "icon": "Clock", "position": 1, "is_enabled": true }
  ]
}`,
  },
  {
    method: "POST",
    path: "/properties-api",
    title: "Criar ou atualizar imóvel",
    description: "Faz upsert pelo par (external_provider, external_id). Inclui detalhes, imagens e overrides de conteúdo das páginas.",
    auth: "X-API-Key",
    params: [
      { name: "name", in: "body", type: "string", required: true, description: "Nome do imóvel (obrigatório)." },
      { name: "external_id", in: "body", type: "string", description: "Identificador no PMS (recomendado p/ idempotência)." },
      { name: "external_provider", in: "body", type: "string", description: "Padrão: stays." },
      { name: "description", in: "body", type: "string", description: "Descrição curta." },
      { name: "status", in: "body", type: "string", description: "active | inactive (padrão active)." },
      { name: "address", in: "body", type: "string", description: "Endereço completo." },
      { name: "booking_url", in: "body", type: "string", description: "Link de reserva (Airbnb, Booking, etc.)." },
      { name: "cover_image_url", in: "body", type: "string", description: "URL da capa." },
      { name: "images", in: "body", type: "string[]", description: "Substitui toda a galeria." },
      { name: "details", in: "body", type: "object", description: "checkin_time, wifi_ssid, wifi_password, lock_code, rules, latitude, longitude, emergency_contacts[], extras{} etc." },
      { name: "pages", in: "body", type: "array", description: "Overrides: [{ page_key, content }] gera blocos de texto na página." },
      { name: "raw", in: "body", type: "object", description: "Payload original do PMS para debug/auditoria." },
    ],
    requestExample: `{
  "external_id": "stays-123",
  "external_provider": "stays",
  "name": "Apto 101 — Vila Madalena",
  "address": "Rua X, 100 — São Paulo/SP",
  "cover_image_url": "https://cdn.example.com/cover.jpg",
  "images": ["https://cdn.example.com/1.jpg"],
  "details": {
    "checkin_time": "15:00",
    "checkout_time": "11:00",
    "wifi_ssid": "MeuWifi",
    "wifi_password": "senha123",
    "lock_code": "5678",
    "latitude": -23.55,
    "longitude": -46.69,
    "emergency_contacts": [{ "name": "Suporte", "phone": "+55 11 99999-0000" }]
  },
  "pages": [
    { "page_key": "rules", "content": "Não é permitido fumar." }
  ]
}`,
    responseExample: `{
  "id": "uuid",
  "public_slug": "apto-101-ab12",
  "created": true,
  "updated": false,
  "pages_updated": 3
}`,
  },
  {
    method: "PUT",
    path: "/properties-api",
    title: "Atualizar imóvel existente",
    description: "Mesmo payload do POST, mas external_id é obrigatório (não cria caso não exista).",
    auth: "X-API-Key",
    responseExample: `{
  "id": "uuid",
  "public_slug": "apto-101-ab12",
  "created": false,
  "updated": true,
  "pages_updated": 1
}`,
  },
  {
    method: "PATCH",
    path: "/properties-api/access",
    title: "Acesso ao hub (senha do hóspede)",
    description:
      "Liga/desliga a proteção \"Acesso ao hub\" de um imóvel e define a senha simples exigida do hóspede. Use ao criar uma nova reserva para gerar a senha automaticamente a partir dos dados do cliente. O tenant_id é obrigatório e precisa ser o mesmo tenant da API key.",
    auth: "X-API-Key",
    params: [
      { name: "tenant_id", in: "body", type: "uuid", required: true, description: "ID do tenant (workspace). Precisa bater com o tenant da API key." },
      { name: "property_id", in: "body", type: "uuid", description: "ID interno do imóvel. Obrigatório se external_id não for enviado." },
      { name: "external_id", in: "body", type: "string", description: "Alternativa ao property_id (ID do imóvel no PMS)." },
      { name: "external_provider", in: "body", type: "string", description: "Usado junto com external_id. Padrão: stays." },
      { name: "enabled", in: "body", type: "boolean", description: "true liga a proteção, false desliga. Para ligar, precisa existir uma senha (já salva ou enviada no mesmo payload)." },
      { name: "password", in: "body", type: "string | null", description: "Senha simples (1–64 chars). Envie null para limpar a senha salva." },
    ],
    requestExample: `{
  "tenant_id": "576bc692-299c-4e1a-a7c9-9d374d09dce8",
  "property_id": "ab40310a-476e-48ed-9af9-e3d5fe3aa5a8",
  "enabled": true,
  "password": "MARIA1406"
}`,
    responseExample: `{
  "id": "uuid",
  "tenant_id": "uuid",
  "access_password_enabled": true,
  "has_password": true,
  "updated_at": "2026-06-28T12:34:56Z"
}`,
  },
  {
    method: "POST",
    path: "/properties-api/lock-code/schedule",
    title: "Agendar senha da fechadura",
    description:
      "Programa a senha da fechadura para ser publicada no guia em uma data/hora e removida automaticamente em outra. Aceita timestamp Unix em segundos (ex: 1787677200), em milissegundos ou ISO 8601. Se apply_at já passou, a senha é aplicada imediatamente. Enviar o mesmo reference substitui o agendamento pendente anterior (idempotente).",
    auth: "X-API-Key",
    params: [
      { name: "property_id", in: "body", type: "uuid", description: "ID interno do imóvel. Obrigatório se external_id não for enviado." },
      { name: "external_id", in: "body", type: "string", description: "Alternativa ao property_id (ID do imóvel no PMS)." },
      { name: "external_provider", in: "body", type: "string", description: "Usado junto com external_id. Padrão: stays." },
      { name: "lock_code", in: "body", type: "string", required: true, description: "Senha da fechadura (1–32 caracteres)." },
      { name: "apply_at", in: "body", type: "number | string", required: true, description: "Quando publicar a senha. Unix em segundos/ms ou ISO 8601." },
      { name: "remove_at", in: "body", type: "number | string", description: "Quando remover a senha. Precisa ser depois de apply_at." },
      { name: "reference", in: "body", type: "string", description: "Sua chave (ex: código da reserva) para reenvios idempotentes e cancelamento." },
      { name: "source", in: "body", type: "string", description: "Origem do agendamento. Padrão: api." },
    ],
    requestExample: `{
  "external_id": "stays-123",
  "external_provider": "stays",
  "lock_code": "4821",
  "apply_at": 1787677200,
  "remove_at": 1787757000,
  "reference": "LP37J"
}`,
    responseExample: `{
  "scheduled": true,
  "property_id": "uuid",
  "property_public_url": "https://hub.mrflow.com.br/g/vila-serena-a1b2",
  "schedule": {
    "id": "uuid",
    "lock_code": "4821",
    "status": "scheduled",
    "apply_at": "2026-08-30T18:00:00Z",
    "apply_at_unix": 1787677200,
    "remove_at": "2026-08-31T16:10:00Z",
    "remove_at_unix": 1787757000,
    "reference": "LP37J"
  }
}`,
  },
  {
    method: "GET",
    path: "/properties-api/lock-code/schedule",
    title: "Listar agendamentos de senha",
    description: "Retorna os agendamentos de senha da fechadura de um imóvel, do mais recente para o mais antigo.",
    auth: "X-API-Key",
    params: [
      { name: "property_id", in: "query", type: "uuid", description: "ID interno do imóvel. Obrigatório se external_id não for enviado." },
      { name: "external_id", in: "query", type: "string", description: "Alternativa ao property_id." },
      { name: "external_provider", in: "query", type: "string", description: "Padrão: stays." },
      { name: "status", in: "query", type: "string", description: "Filtra por scheduled | applied | removed | canceled | failed." },
    ],
    responseExample: `{
  "property_id": "uuid",
  "property_public_url": "https://hub.mrflow.com.br/g/vila-serena-a1b2",
  "count": 1,
  "items": [
    {
      "id": "uuid",
      "lock_code": "4821",
      "status": "applied",
      "apply_at_unix": 1787677200,
      "remove_at_unix": 1787757000,
      "reference": "LP37J"
    }
  ]
}`,
  },
  {
    method: "DELETE",
    path: "/properties-api/lock-code/schedule",
    title: "Cancelar agendamento de senha",
    description: "Cancela agendamentos ainda pendentes por schedule_id ou por reference (ex: ao cancelar a reserva). Agendamentos já aplicados não são alterados.",
    auth: "X-API-Key",
    params: [
      { name: "schedule_id", in: "body", type: "uuid", description: "ID do agendamento. Também aceito como ?schedule_id= na query." },
      { name: "reference", in: "body", type: "string", description: "Cancela todos os pendentes com esse reference. Também aceito na query." },
    ],
    requestExample: `{
  "reference": "LP37J"
}`,
    responseExample: `{
  "canceled": 1,
  "items": [
    {
      "id": "uuid",
      "status": "canceled",
      "property_public_url": "https://hub.mrflow.com.br/g/vila-serena-a1b2"
    }
  ]
}`,
  },
];




const methodColor: Record<Endpoint["method"], string> = {
  GET: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  PATCH: "bg-purple-500/15 text-purple-700 border-purple-500/30",
  DELETE: "bg-destructive/15 text-destructive border-destructive/30",
};

function CodeBlock({ children }: { children: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      toast.success("Copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };
  return (
    <div className="relative group">
      <pre className="text-xs bg-muted/50 border rounded-md p-3 overflow-x-auto font-mono leading-relaxed">
        <code>{children}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1.5 right-1.5 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copy}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function EndpointRow({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);
  const fullUrl = `${BASE_URL}${ep.path}`;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left">
          <Badge variant="outline" className={cn("font-mono text-[10px] uppercase", methodColor[ep.method])}>
            {ep.method}
          </Badge>
          <code className="text-sm font-mono truncate flex-1">{ep.path}</code>
          <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[40%]">{ep.title}</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 border-t bg-background/50 space-y-4">
          <p className="text-sm text-foreground/80">{ep.description}</p>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Endpoint</p>
            <CodeBlock>{`${ep.method} ${fullUrl}`}</CodeBlock>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Autenticação</p>
            <p className="text-xs text-foreground/80">
              Header <code className="px-1 py-0.5 rounded bg-muted text-[11px]">{ep.auth}: SUA_CHAVE</code>
            </p>
          </div>

          {ep.params && ep.params.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parâmetros</p>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Nome</th>
                      <th className="px-3 py-2 font-medium">Em</th>
                      <th className="px-3 py-2 font-medium">Tipo</th>
                      <th className="px-3 py-2 font-medium">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ep.params.map((p) => (
                      <tr key={p.name} className="border-t">
                        <td className="px-3 py-2 font-mono">
                          {p.name}
                          {p.required && <span className="text-destructive ml-1">*</span>}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{p.in}</td>
                        <td className="px-3 py-2 text-muted-foreground font-mono">{p.type}</td>
                        <td className="px-3 py-2 text-foreground/80">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {ep.requestExample && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exemplo de requisição</p>
              <CodeBlock>{ep.requestExample}</CodeBlock>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exemplo de resposta</p>
            <CodeBlock>{ep.responseExample}</CodeBlock>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">cURL</p>
            <CodeBlock>
              {ep.method === "GET"
                ? `curl -H "X-API-Key: SUA_CHAVE" \\
  "${fullUrl}"`
                : `curl -X ${ep.method} -H "X-API-Key: SUA_CHAVE" \\
  -H "Content-Type: application/json" \\
  -d '${ep.requestExample ? ep.requestExample.replace(/\n\s*/g, " ") : "{}"}' \\
  "${fullUrl}"`}
            </CodeBlock>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ApiReference() {
  return (
    <Card className="p-5 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-accent-foreground" />
          <div>
            <h2 className="font-semibold text-lg">Documentação da API</h2>
            <p className="text-xs text-muted-foreground">
              Endpoints REST para integrar com sistemas externos (n8n, Make, Zapier, scripts).
              Autentique todas as chamadas com o header <code className="px-1 py-0.5 rounded bg-muted">X-API-Key</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1">
        <p className="text-muted-foreground">Base URL</p>
        <code className="font-mono text-foreground break-all">{BASE_URL}</code>
      </div>

      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs space-y-1">
        <p className="font-medium text-foreground">Webhooks de conexão (Stays / Hostaway)</p>
        <p className="text-muted-foreground">
          O campo <code className="px-1 py-0.5 rounded bg-muted">callback.api_key</code> sempre reutiliza a última chave ativa do painel. Reconectar Stays/Hostaway ou iniciar importações não revoga nem troca a chave automaticamente, para não quebrar automações existentes.
        </p>
      </div>

      <div className="border rounded-md divide-y">
        {ENDPOINTS.map((ep) => (
          <EndpointRow key={`${ep.method}-${ep.path}-${ep.title}`} ep={ep} />
        ))}
      </div>
    </Card>
  );
}
