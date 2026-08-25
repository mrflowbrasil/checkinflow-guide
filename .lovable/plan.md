# Senha de fechadura agendada (API)

## O que já existe hoje

- **API pública `properties-api`** autenticada por `X-API-Key` do tenant, com:
  - `GET /properties-api` (lista de imóveis, filtros)
  - `GET /properties-api/pages` e `/pages-catalog`
  - `POST|PUT /properties-api` (upsert do imóvel, incluindo `details.lock_code`)
  - `PATCH /properties-api/access` (liga/desliga senha de acesso ao hub)
- A senha da fechadura vive em `property_details.lock_code` e é exibida no guia através de um bloco `password` na página `lock_code` (bloco gerado como `source = 'auto'`).
- Já existe infraestrutura de agendamento no projeto: `pg_cron` + `pg_net` (usados pela fila de e-mails e pela expiração de trial).

Hoje só é possível gravar a senha **imediatamente**. Não existe agendamento.

## O que será implementado

### 1. Nova tabela `public.property_lock_code_schedules`
Campos de domínio: `tenant_id`, `property_id`, `lock_code`, `apply_at` (quando publicar),
`remove_at` (quando apagar, opcional), `status` (`scheduled` | `applied` | `removed` | `canceled` | `failed`),
`applied_at`, `removed_at`, `last_error`, `source` (ex.: `api`), `reference` (id da reserva, opcional).
Acesso: dono do tenant lê/gerencia os agendamentos do próprio tenant; funções de servidor têm acesso total.

### 2. Novos endpoints na `properties-api`
- `POST /properties-api/lock-code/schedule`
  - Identifica o imóvel por `property_id` **ou** `external_id` (+ `external_provider`).
  - Corpo: `lock_code`, `apply_at` (ISO 8601 com timezone), `remove_at` (opcional), `reference` (opcional).
  - Valida: senha 1–32 caracteres, `apply_at` válido, `remove_at > apply_at`.
  - Se `apply_at` já passou, aplica na hora.
- `GET /properties-api/lock-code/schedule?property_id=|external_id=` — lista agendamentos do imóvel.
- `DELETE /properties-api/lock-code/schedule` — cancela por `schedule_id` (ou por `reference`).

### 3. Processador `process-lock-code-schedules` (edge function + cron)
Roda a cada minuto via `pg_cron`/`pg_net`:
- `apply_at <= now()` e status `scheduled` → grava `property_details.lock_code` e recria o bloco `password` da página `lock_code`; status vira `applied`.
- `remove_at <= now()` e status `applied` → limpa `lock_code` e remove o bloco; status vira `removed`.
- Erros ficam registrados em `last_error` sem travar os demais registros.

### 4. Documentação
`src/components/integrations/ApiReference.tsx` ganha a seção "Senha de fechadura agendada" com parâmetros, respostas e cURL pronto para copiar (mesmo padrão dos endpoints atuais).

## Detalhes técnicos
- Reaproveita `sha256` + `tenant_api_keys` para autenticação (mesma chave já usada pelas automações).
- Escrita dos blocos segue a regra atual: só substitui blocos `source = 'auto'`, preservando edições manuais.
- Todas as datas trafegam em ISO 8601 (`2026-08-30T15:00:00-03:00`) e são guardadas em `timestamptz`.
