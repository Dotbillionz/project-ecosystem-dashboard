# CrownOps Ecosystem Dashboard

Executive technology command center for a fintech + blockchain ecosystem.

## Monorepo layout

- `artifacts/api-server` — Node.js + Express control-plane API (webhooks, alerts, executive briefing endpoints).
- `artifacts/ecosystem-dashboard` — React executive dashboard UI.
- `lib/*` — shared API schema, DB package, auth client helpers.

## Milestone 1 scaffold delivered

### Backend modules (Express)

- **Security baseline**: hardened headers + bounded JSON payloads.
- **Role-based access control**: `viewer`, `operator`, `executive` via `x-crownops-role` and executive email allowlist.
- **GitHub webhook listener**: `POST /api/integrations/github/webhook`
  - Verifies `x-hub-signature-256` against `GITHUB_WEBHOOK_SECRET`.
  - Triggers workflow dispatch through GitHub Actions API.
- **Ops notifications**: Slack + Telegram dispatcher with test endpoint.
- **Executive API**:
  - `GET /api/executive/status` (operator+)
  - `GET /api/executive/briefing` (executive only)
  - Includes daily-brief style health summary for integrations, priorities, and alerts.

### Frontend layout (React)

- New **CrownOps Executive Dashboard** page at `/`.
- Existing portfolio ecosystem dashboard moved to `/ecosystem`.
- KPI strip + modular control center cards for Engineering, Payments, and Ops/Compliance.

## Local setup

```bash
pnpm install
cp artifacts/api-server/.env.example artifacts/api-server/.env
pnpm --filter @workspace/api-server dev
pnpm --filter @workspace/ecosystem-dashboard dev
```

## Key API endpoints

- `POST /api/integrations/github/webhook`
- `POST /api/integrations/alerts/test`
- `GET /api/executive/status`
- `GET /api/executive/briefing`

## Security notes

- Store all secrets in environment variables only.
- Rotate any credential that is ever posted in plaintext.
- Use least-privilege tokens for GitHub Actions dispatch + notification channels.
