# Stripe Setup — QuizMeBaby

## Produtos e Preços a Criar no Stripe (PRODUÇÃO)

Acesse https://dashboard.stripe.com/products e crie:

### Produto 1: QuizMeBaby Pro
- **Nome:** QuizMeBaby Pro
- **Preço mensal:** R$ 47,00 (BRL, recorrente mensal)
- **Preço anual:** R$ 397,00 (BRL, recorrente anual)

### Produto 2: QuizMeBaby Business
- **Nome:** QuizMeBaby Business
- **Preço mensal:** R$ 97,00 (BRL, recorrente mensal)
- **Preço anual:** R$ 897,00 (BRL, recorrente anual)

---

## Variáveis de Ambiente Necessárias

Após criar os produtos no Stripe, copie os IDs de preço (price_...) e configure:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (copiar do painel Stripe após criar os produtos)
STRIPE_PRO_PRICE_ID=price_...          # Pro mensal R$47
STRIPE_PRO_ANNUAL_PRICE_ID=price_...    # Pro anual R$397
STRIPE_BUSINESS_PRICE_ID=price_...      # Business mensal R$97
STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_... # Business anual R$897

# GHL (Full Funnel) — já configurado
GHL_PRIVATE_TOKEN=pit-4ac80803-e5e0-4aa0-abe9-3e65a383bc17
GHL_LOCATION_ID=xqBFeOe8aUuZI8tfnSDv
```

Configure essas variáveis em:
1. `.env.local` (desenvolvimento)
2. Vercel → Settings → Environment Variables (produção)

---

## Webhook Stripe

### URL do Webhook
```
https://go.quizmebaby.app/api/billing/webhook
```

### Eventos para Escutar
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

### Como Configurar
1. Acesse https://dashboard.stripe.com/webhooks
2. Clique "Add endpoint"
3. URL: `https://go.quizmebaby.app/api/billing/webhook`
4. Selecione os 5 eventos acima
5. Copie o Signing Secret e coloque em `STRIPE_WEBHOOK_SECRET`

---

## Custom Fields GHL

Criar estes custom fields no GHL (Full Funnel) → Settings → Custom Fields:

| Nome interno | Label | Tipo |
|---|---|---|
| `qmb_plano` | QMB Plano | Text |
| `qmb_status` | QMB Status | Text |
| `qmb_data_inicio` | QMB Data Início | Text |
| `qmb_data_cancelamento` | QMB Data Cancelamento | Text |
| `qmb_stripe_customer_id` | QMB Stripe Customer ID | Text |

---

## Fluxo de Eventos

1. **Novo assinante** (`checkout.session.completed`):
   - Atualiza banco local (plano, stripeCustomerId, stripeSubscriptionId)
   - GHL: upsert contato com tags `quizmebaby-cliente`, `plano-{pro|business}`, `assinante-ativo`

2. **Upgrade/downgrade** (`customer.subscription.updated`):
   - Atualiza plano no banco
   - GHL: atualiza tag de plano

3. **Cancelamento** (`customer.subscription.deleted`):
   - Volta pro plano free no banco
   - GHL: remove `assinante-ativo` e `plano-*`, adiciona `cancelado`, `ex-assinante`

4. **Pagamento falhou** (`invoice.payment_failed`):
   - GHL: adiciona `pagamento-falhou`, remove `assinante-ativo`

5. **Pagamento sucesso** (`invoice.payment_succeeded`):
   - GHL: remove `pagamento-falhou`, adiciona `assinante-ativo`
