# Cases BR — QuizMeBaby

Social proof nacional para campanhas. Meta: **3-5 cases reais** de clientes ativos.

## Estrutura da pasta

```
docs/cases/
├── README.md                    # este arquivo
├── template-coleta.md           # ficha interna para documentar cada case
├── formulario-cliente.md        # questionário para enviar ao cliente
└── raw/                         # material bruto por cliente (pasta por nome)
    └── [slug-cliente]/
        ├── respostas.md         # respostas do formulário
        ├── termo-autorizado.pdf # termo de uso de imagem/voz assinado
        ├── foto-perfil.*        # foto autorizada
        └── video.*              # vídeo 30-60s (se houver)
```

## Perfis prioritários (ICO-161)

| Prioridade | Perfil              | Qtd |
|-----------|---------------------|-----|
| 1         | Agências            | 2   |
| 2         | Infoprodutores/lançamentos | 2 |
| 3         | E-commerce/outros   | 1 (opcional) |

## Status de coleta

| Cliente | Perfil | Status | Números-chave | Vídeo |
|---------|--------|--------|--------------|-------|
| —       | —      | aguardando lista | — | — |

## Fluxo de coleta

1. Identificar clientes ativos (CRM/Supabase) → responsável: equipe comercial
2. Enviar `formulario-cliente.md` + termo de imagem → via email/WhatsApp
3. Documentar resposta em `raw/[slug-cliente]/respostas.md`
4. Coletar foto + vídeo + termo assinado
5. Preencher `template-coleta.md` com dados finais
6. Handoff para @claudinho montar peças

## Termo de uso de imagem

Rascunho em `docs/cases/termo-autorizacao-imagem-voz.md` (v0.1 — aguardando aprovação jurídica em [ICO-163](/ICO/issues/ICO-163)).

**Conteúdo coberto:**
- Identificação completa (nome + CPF) do autorizante e do controlador
- Finalidades granulares: orgânico (site, redes, newsletter) vs. mídia paga (Meta, Google, TikTok, LinkedIn)
- Uso de logo/marca da empresa representada + uso de métricas (nominal vs. anonimizado)
- Prazo (indeterminado ou determinado) + abrangência nacional/internacional
- Canal e prazos de revogação (confirmação em 5 dias úteis, remoção orgânica em 15 dias úteis, pausa em mídia paga em 5 dias úteis)
- Base legal LGPD: consentimento (Art. 7º, I) + demais direitos do titular (Art. 18)
- Assinatura aceita: física, eletrônica (DocuSign/Clicksign/ZapSign/D4Sign) ou ICP-Brasil

**Fluxo após aprovação:**
1. Preencher campos do controlador (razão social, CNPJ, endereço, e-mail do DPO)
2. Exportar `termo-autorizacao-imagem-voz.md` → `termo-autorizacao-imagem-voz-v1.pdf`
3. Enviar ao cliente **junto com** `formulario-cliente.md`, antes do disparo
4. Arquivar termo assinado em `docs/cases/raw/[slug-cliente]/termo-autorizado.pdf`

**Não disparar formulário sem:** (1) termo aprovado pelo jurídico, (2) campos do controlador preenchidos, (3) versão PDF final assinada pelo representante legal do QuizMeBaby.
