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

Modelo de termo deve ser aprovado pelo jurídico/responsável antes do envio.
Mínimo necessário:
- Nome completo + documento
- Autorização de uso de imagem, voz e depoimento para fins de marketing
- Alcance: digital (redes sociais, site, anúncios pagos)
- Prazo: indeterminado (ou definido)
- Revogação: mediante solicitação formal
