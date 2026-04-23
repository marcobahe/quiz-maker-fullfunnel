# Pré-scope técnico — Template "Funil Dinâmico Bressan" nativo QMB

> **Status:** pré-scope (negotiation ammo) · **Não é compromisso de roadmap.**
> Gatilho de priorização: Bressan fechar deal (ICO-200 Fase 2) + volume de conversão via cupom `BRESSAN` justificar.
> Criado por @opus · 2026-04-23 · Origem: [ICO-203](/ICO/issues/ICO-203)

---

## 1. Definição de "template nativo"

**Onde:** entrada nova em `src/data/templates.js` (lib já existente, 10+ templates catalogados), exposta em `src/app/templates/page.jsx` via `TemplateGallery`.

**Categoria:** nova categoria `"Funil Dinâmico"` (separa de `"Lead Generation"` / `"Quiz de Produto"`) — sinaliza na UI que é template de alto-nível com score + regras + lead form integrado, não quiz básico.

**Co-brand:** opção recomendada para negociação → **"Inspirado em Matheus Bressan"** com link pro YT `5FC3qdIjclo` (27min). Logo dele opcional no thumbnail/preview, não no produto final do cliente.
Alternativa (mais forte, mais caro): autoria completa co-assinada ("by Matheus Bressan × QuizMeBaby") — exige contrato de licenciamento de conteúdo + royalty.
**Decisão de co-brand = @theboss/@marco.** Doc aqui só sinaliza opções.

**Estrutura (reproduz framework `5FC3qdIjclo` — deep-mine em `docs/research/deep-bressan-yt.md`):**

| # | Fase | Mecânica QMB | Nó no canvas |
|---|------|---------------|---------------|
| 1 | Pergunta inicial (hook/entrada) | `composite` + `question-single` com peso de score | start → q1 |
| 2 | Admitir problema | `question-single` com opções que somam score ao mapear dor | q2 |
| 3 | Solução com mistério | `composite` + texto + `question-single` — cria gancho antes de revelar | q3 |
| 4 | Sucesso presumido | `question-single` — pergunta já assumindo conversão (ex: "o que você faria com X?") | q4 |
| 5 | Sequência de Sims (micro-commitments) | 2-3 `question-single` rápidas com opções "sim/sim/sim" — ancora neurociência (verbatim Bressan ~22:30) | q5a-q5c |
| 6 | Oferta | `lead-form` + redirect pra página de vendas OU `result` com CTA direto | q6 → result |

Sobre essa estrutura roda: **score accumulation** (já existe: `scoreMultiplier`, `scoreRanges`) + **branching condicional** (já existe: `sourceHandle` nas edges) + **lead-form element** (já existe).

---

## 2. Effort — number-to-beat

### Dependências técnicas (baseline)

| Componente | Status QMB | Gap pra Bressan template |
|-------------|-------------|---------------------------|
| Biblioteca de templates | ✅ existe (`templates.js` + gallery) | Zero — só adicionar entry |
| Composite nodes | ✅ existe | Zero |
| Score por opção + ranges | ✅ existe | Zero |
| Branching condicional (edge sourceHandle) | ✅ existe | Zero |
| Lead form element | ✅ existe | Zero |
| "Regras de exibição" intra-node (mostrar/ocultar elementos por score corrente) | ⚠️ **a confirmar** — QMB roteia entre nós, Bressan também roteia dentro do nó no inLead | Se não existir, +3-5 dias pra adicionar `showIf`/`hideIf` nos elements |
| Categoria nova na UI | ✅ trivial | <1h |
| Thumbnail co-brand | ⚠️ depende de decisão co-brand + @picasso briefing | 0.5-1 dia |
| Co-brand legal (autorização uso da marca) | ❌ fora do escopo técnico | N/A (deal) |

### Estimativa em person-days

| Cenário | Effort total | Breakdown |
|----------|---------------|-----------|
| **Low** (regras de exibição intra-node já existem; co-brand = "inspirado em") | **2-3 pd** | Content authoring do template JSON (1.5 pd) + QA no player (0.5 pd) + categoria/thumbnail (0.5 pd) |
| **Mid** (regras intra-node NÃO existem; precisa implementar `showIf` simples em composite elements) | **5-7 pd** | Low + `showIf`/`hideIf` em elements (2 pd) + extensão Properties Panel (1.5 pd) + migration (0.5 pd) + regression QA (0.5 pd) |
| **High** (autoria completa co-assinada + multi-idioma + dashboard "régua Bressan" §8.2 do research) | **12-18 pd** | Mid + i18n conteúdo template (2 pd) + painel métricas-régua 70/5/60/15/15-40% nativo (5-8 pd) + revisão editorial com Bressan (2 pd) |

**Recomendação pra negociação:** prometer janela **Low-Mid** (ex: 7 pd úteis = ~2 semanas com 1 dev) assumindo gap de regras intra-node. Se Bressan topar "inspirado em" (não co-assinado), entrega cai pra Low.

### Riscos

1. **IP do framework (baixo):** framework de 6 fases é metodologia comercial pública (ensinada em YT aberto). Não há copyright sobre estrutura. **Risco mitigado com disclaimer "inspirado em".**
2. **Conflito legal com inLead (médio):** inLead ensina framework similar, mas não detém direito exclusivo. Atenção se inLead tiver contrato de exclusividade com Bressan (research ICO-200 §2 indica afiliação *dormente*, não exclusiva — **safe**).
3. **Autorização de uso da marca (alto se co-assinado):** opção "by Bressan × QMB" exige contrato. "Inspirado em" pode avançar com consentimento informal por escrito (DM/email) — preferível pra velocidade.
4. **Obsolescência narrativa:** se Bressan reposicionar público ("sai do quiz, entra em X"), template vira âncora em narrativa desatualizada. **Mitigação:** cláusula de revisão semestral no deal.

---

## 3. Faixa de compromisso negociável

**Gatilho sugerido (pra @theboss usar no outreach):**

> "A partir de **X assinaturas pagas atribuídas ao cupom `BRESSAN`** em 30-60 dias pós-ativação do deal, entramos com o template nativo `Funil Dinâmico Bressan` na biblioteca do QMB."

**Faixas sugeridas (@theboss ajusta no pitch):**

| Compromisso | Gatilho | Janela pós-gatilho |
|--------------|---------|---------------------|
| Conservador | 50 assinaturas pagas via `BRESSAN` em 60d | 3-4 semanas úteis |
| Moderado | 30 assinaturas pagas via `BRESSAN` em 45d | 2-3 semanas úteis |
| Otimista (signaling de comprometimento alto) | 15 assinaturas pagas via `BRESSAN` em 30d | 1-2 semanas úteis |

Qualquer faixa assume dev alocado parcialmente (não bloquear launch QMB 30/04). **Janela só conta dias úteis pós-launch QMB** (ou seja, começa depois de 2026-05-01 mesmo que gatilho dispare antes).

**Não-escopo do 1-pager:** decisão de qual faixa apresentar (@theboss), volume de comissão afiliada (@theboss/@marco), cronograma fino (fica com @cto quando virar compromisso real).

---

## 4. O que entra no material de outreach (@claudinho)

- "Template nativo co-branded é possível" — sim, pré-escopado, 2-7 pd úteis dependendo do co-brand.
- "Refiz seu framework de 6 fases em QuizMeBaby" — já é viável hoje com infra atual, sem build novo (demonstração manual pré-assinatura).
- "Dashboard das 5 métricas-régua" — **fora deste pré-scope** (esforço high, §2). Só mencionar se Bressan pedir algo específico.

---

## Fontes

- Research parent: `docs/research/partnership-bressan.md` §8.2
- Deep-mine YT: `docs/research/deep-bressan-yt.md` (vídeo `5FC3qdIjclo` 27min, vocabulário ICO-195)
- Infra QMB template: `src/data/templates.js` (1239 linhas, 10+ templates), `src/components/Templates/TemplateGallery.jsx`, `src/app/templates/page.jsx`
- Player score/branching: `src/app/q/[slug]/QuizPlayerClient.jsx` (scoreRanges, sourceHandle branching, lead-form)
