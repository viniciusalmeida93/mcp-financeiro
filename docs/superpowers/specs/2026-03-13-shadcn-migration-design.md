# Design Spec: Migração para shadcn/ui + Tailwind CSS

**Data:** 2026-03-13
**Projeto:** VA Studio Financeiro
**Status:** Aprovado

---

## Contexto e Motivação

O app VA Studio Financeiro usa um design system customizado com CSS puro (1402 linhas em `main.css`) e componentes UI próprios. A proposta é substituir esse sistema pelo shadcn/ui + Tailwind CSS para obter:

- Componentes acessíveis e bem testados (shadcn/ui)
- Sistema de temas robusto via CSS variables
- Layout responsivo (mobile + desktop)
- Manutenção mais simples a longo prazo

---

## Decisões de Design

| Decisão | Escolha |
|---|---|
| Stack de estilo | Tailwind CSS v4 + shadcn/ui |
| Sistema de temas | Dois temas completos via `data-theme` |
| Layout | Responsivo: bottom nav (mobile) + sidebar (desktop) |
| Estratégia de migração | Layer-by-layer (4 camadas, branch por camada) |

---

## Estratégia de Branches

Cada camada é desenvolvida em uma branch separada e commitada antes de iniciar a próxima:
- `feat/shadcn-layer-1-infra`
- `feat/shadcn-layer-2-layout`
- `feat/shadcn-layer-3-ui-base`
- `feat/shadcn-layer-4-pages`

Em caso de problema, basta reverter a branch da camada problemática.

---

## Sistema de Temas

### Formato de cores

shadcn/ui requer que as CSS variables de cor sejam declaradas em **valores de canal HSL** (sem a função `hsl()`), não em hex. Exemplo:

```css
/* CORRETO para shadcn */
--primary: 210 60% 30%;        /* equivale a #1f507a */

/* ERRADO — shadcn não interpretará */
--primary: #1f507a;
```

### Dois temas via `data-theme`

**Regra de estrutura:** Todas as variáveis que o shadcn sempre precisa (`--background`, `--card`, `--popover`, `--border`, etc.) ficam no `:root` nu — garantindo que sempre estejam definidas, mesmo se o atributo `data-theme` ainda não foi aplicado. Apenas as variáveis que diferem entre os dois temas (`--primary`, `--secondary`, `--accent`) ficam nos seletores `[data-theme]`.

```css
/* src/styles/globals.css */
/* IMPORTANTE: deve ser o primeiro CSS importado em main.jsx */
@import "tailwindcss";

/* Variáveis sempre disponíveis — independente do tema */
:root {
  --background: 0 0% 97%;
  --foreground: 213 22% 10%;
  --card: 0 0% 100%;
  --card-foreground: 213 22% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 213 22% 10%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --radius: 0.5rem;
  --muted: 220 14% 96%;
  --muted-foreground: 220 8% 46%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;

  /* Fallback para tema empresa (evita flash antes de data-theme ser aplicado) */
  --primary: 210 60% 30%;
  --primary-foreground: 0 0% 100%;
  --secondary: 210 60% 95%;
  --secondary-foreground: 210 60% 30%;
  --accent: 210 60% 95%;
  --accent-foreground: 210 60% 30%;
  --ring: 210 60% 30%;
}

/* Tema Empresa — azul (sobrescreve os fallbacks do :root) */
[data-theme="empresa"] {
  --primary: 210 60% 30%;           /* #1f507a */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 60% 95%;         /* #e8f0f9 */
  --secondary-foreground: 210 60% 30%;
  --accent: 210 60% 95%;
  --accent-foreground: 210 60% 30%;
  --ring: 210 60% 30%;
}

/* Tema Pessoal — laranja */
[data-theme="pessoal"] {
  --primary: 18 100% 60%;           /* #FF6B35 */
  --primary-foreground: 0 0% 100%;
  --secondary: 18 100% 97%;         /* #fff3ee */
  --secondary-foreground: 18 100% 60%;
  --accent: 18 100% 97%;
  --accent-foreground: 18 100% 60%;
  --ring: 18 100% 60%;
}
```

### Aplicação do tema sem flash

Para evitar que o app renderize sem `data-theme` no primeiro frame, adicionar um script inline em `index.html` **antes** do bundle React:

```html
<!-- index.html, dentro de <head>, antes de qualquer CSS -->
<script>
  (function() {
    var ctx = localStorage.getItem('va-contexto') || 'empresa';
    document.documentElement.setAttribute('data-theme', ctx);
  })();
</script>
```

O `AppWrapper.jsx` continua aplicando o atributo via `useEffect` ao trocar de contexto, e persiste em `localStorage` com a chave `'va-contexto'`:

```js
useEffect(() => {
  document.documentElement.setAttribute('data-theme', contexto);
  localStorage.setItem('va-contexto', contexto);
}, [contexto]);
```

---

## Camada 1: Infraestrutura

**Objetivo:** Base técnica do shadcn funcionando, sem mudança visual ainda.

### Compatibilidade Tailwind v4 + shadcn

Tailwind v4 elimina o `tailwind.config.ts` e usa `@tailwindcss/vite` em vez de PostCSS. O `shadcn init` por padrão gera configuração para v3. A reconciliação é feita manualmente:

1. Instalar `tailwindcss` v4 e `@tailwindcss/vite` — **não** instalar `autoprefixer` ou `postcss`
2. Adicionar o plugin ao `vite.config.js`:
   ```js
   import tailwindcss from '@tailwindcss/vite'
   export default { plugins: [tailwindcss(), react()] }
   ```
3. Executar `npx shadcn@latest init` e selecionar CSS Variables como estratégia
4. Se o `shadcn init` gerar `postcss.config.js` ou `tailwind.config.ts`, **deletá-los** — são incompatíveis com v4
5. Substituir qualquer `@tailwind base/components/utilities` no CSS gerado por `@import "tailwindcss"`

### Coexistência de CSS durante a migração

Durante as Camadas 1–3, ambos os arquivos serão importados em `main.jsx`:
```js
import './styles/globals.css'  // shadcn + Tailwind (novo)
import './styles/main.css'     // legado (removido ao final da Camada 4)
```

Para evitar conflitos de variáveis CSS, renomear em `main.css` as variáveis que colidem com as do shadcn adicionando prefixo `--va-`. As variáveis conhecidas que colidem são:

| Nome atual em `main.css` | Renomear para |
|---|---|
| `--primary` | `--va-primary` |
| `--primary-light` | `--va-primary-light` |
| `--background` | `--va-background` |
| `--card-bg` | `--va-card-bg` |
| `--border` | `--va-border` |
| `--input-height` | `--va-input-height` (não colide, mas padronizar) |
| `--radius-*` | `--va-radius-*` (shadcn usa `--radius` sem sufixo) |
| `--muted` | `--va-muted` |
| `--destructive` | `--va-destructive` |

Após renomear, fazer busca por qualquer outro uso de `var(--primary)`, `var(--background)`, etc. em `main.css` e substituir pelo prefixo `--va-`.

`main.css` é **removido completamente ao final da Camada 4**.

### Path do `lib/utils.ts`

O shadcn deve ser configurado para gerar em `src/lib/utils.ts` (dentro de `src/`). Durante o `shadcn init`, definir:
- Components path: `src/components/ui`
- Utils path: `src/lib/utils`
- Confirmar no `components.json` gerado que `aliases.utils` aponta para `@/lib/utils`

### Passos completos da Camada 1

1. Instalar dependências: `tailwindcss`, `@tailwindcss/vite`, `lucide-react` (verificar versão compatível com shadcn — usar a que o `shadcn init` instala automaticamente)
2. Atualizar `vite.config.js` com plugin Tailwind v4
3. Executar `npx shadcn@latest init` configurando paths para `src/`
4. Deletar arquivos de configuração v3 gerados pelo shadcn (`postcss.config.js`, `tailwind.config.ts`)
5. Criar `src/styles/globals.css` com a estrutura de temas definida acima
6. Renomear variáveis conflitantes em `main.css` com prefixo `--va-`
7. Atualizar `src/main.jsx` para importar `globals.css` antes de `main.css`
8. Adaptar `AppWrapper.jsx` para aplicar `data-theme` no `document.documentElement`

**Arquivos afetados:**
- `vite.config.js`
- `package.json`
- `src/main.jsx`
- `src/styles/main.css` (renomear variáveis conflitantes)
- `src/styles/globals.css` (novo)
- `src/components/Layout/AppWrapper.jsx`
- `components.json` (gerado)
- `src/lib/utils.ts` (gerado)

---

## Camada 2: Layout Responsivo

**Objetivo:** Novo shell do app (header, sidebar, bottom nav) responsivo.

### AppWrapper
- Mobile: `flex flex-col h-screen` com header fixo + conteúdo scrollável + bottom nav fixo
- Desktop (`md:`): `flex flex-row h-screen` com sidebar fixa + área de conteúdo

### Header
- Mobile: logo/título da página + toggle de contexto
- Desktop: apenas título da página (sidebar já tem navegação)
- Usa shadcn `<Separator>`

### Sidebar (desktop only, `hidden md:flex`)
- Largura: 240px fixa
- Logo VA Studio no topo
- Links de navegação com ícones Lucide
- `<ContextToggle>` na base
- Sidebar sempre visível no desktop (não usa `<Sheet>`)

### BottomNav (mobile only, `md:hidden`)
- 5 rotas: Dashboard, Lançamentos, Categorias, Relatórios, Cartões
- Fix do bug de scroll: `flex overflow-hidden` no container, items com `flex-1 min-w-0`
- Ícones Lucide + label abaixo
- Highlight da rota ativa com `text-primary`

**Arquivos afetados:**
- `src/components/Layout/AppWrapper.jsx`
- `src/components/Layout/Header.jsx`
- `src/components/Layout/Sidebar.jsx` (novo)
- `src/components/UI/BottomNav.jsx`

---

## Camada 3: Componentes UI Base

**Substituições diretas por componentes shadcn:**

| Arquivo atual | shadcn equivalente | Comando de instalação |
|---|---|---|
| `UI/Button.jsx` | `<Button>` | `npx shadcn add button` |
| `UI/Card.jsx` | `<Card>`, `<CardHeader>`, `<CardContent>`, `<CardFooter>` | `npx shadcn add card` |
| `UI/Modal.jsx` | `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, `<DialogFooter>` | `npx shadcn add dialog` |
| `UI/Input.jsx` | `<Input>` + `<Label>` | `npx shadcn add input label` |
| `UI/Select.jsx` | `<Select>`, `<SelectTrigger>`, `<SelectContent>`, `<SelectItem>` | `npx shadcn add select` |
| `UI/Badge.jsx` | `<Badge>` | `npx shadcn add badge` |

**Componentes customizados reestilizados:**

| Arquivo | Abordagem |
|---|---|
| `UI/ContextToggle.jsx` | Reconstruído com shadcn `<ToggleGroup>` (semanticamente correto para dois estados mutuamente exclusivos) |
| `UI/ContextBadge.jsx` | Usa shadcn `<Badge>` com classe de tema |
| `UI/LoadingScreen.jsx` | Usa shadcn `<Skeleton>` |
| `UI/EmptyState.jsx` | Mantido, reestilizado com Tailwind |

**Novos componentes shadcn:**

| Componente | Comando | Uso |
|---|---|---|
| `<Tabs>` | `npx shadcn add tabs` | Filtros Empresa/Pessoal/Ambos |
| `<Table>` | `npx shadcn add table` | Listas de lançamentos, relatórios, clientes |
| `<Popover>` + `<Calendar>` | `npx shadcn add popover calendar` | DatePicker (não existe componente nativo — combinar Popover + Calendar + react-day-picker) |
| `<Sonner>` | `npx shadcn add sonner` | Feedback de ações (sucesso/erro) |
| `<AlertDialog>` | `npx shadcn add alert-dialog` | Confirmações de exclusão |
| `<Skeleton>` | `npx shadcn add skeleton` | Estados de loading |
| `<ToggleGroup>` | `npx shadcn add toggle-group` | ContextToggle |

> **Nota DatePicker:** shadcn não tem `datepicker` como componente instalável. A implementação combina `<Popover>` + `<Calendar>` do shadcn com `react-day-picker` (instalado automaticamente com `calendar`). Não executar `npx shadcn add datepicker`.

---

## Camada 4: Páginas e Features

Ordem de migração: da página com **menos dependências de componentes compartilhados** para a de **mais**. Dashboard é deixado por último por depender de todos os outros módulos funcionando. Lançamentos e Relatórios antecedem o Dashboard por serem as fontes de dados que ele exibe.

1. **Cartões** (`CartoesPage`, `CartaoItem`, `NovoCartao`)
   - Fix incluso: substituir "Todos" por "Ambos" nos filtros (usar `<Tabs>`)
   - `<Card>` por cartão, `<Dialog>` para criação

2. **Categorias** (`CategoriasPage`, `NovaCategoria`)
   - Lista com `<Card>`, `<Dialog>` para nova categoria

3. **Contas** (`ContasPage`, `ContaItem`, `NovaDespesaFixa`, `ListaDespesasFixas`)
   - `<Card>` por conta, `<Table>` para despesas fixas

4. **Clientes** (`ClientesPage`, `ClienteItem`, `NovoCliente`, `ListaClientes`, `GestaoNF`)
   - `<Table>` para lista, `<Tabs>` para gestão de NF

5. **Lançamentos** (`LancamentosPage`, `LancamentoItem`, `ListaLancamentos`, `NovoLancamento`)
   - `<Table>` com filtros via `<Select>`, DatePicker (Popover+Calendar), `<Sonner>` para feedback

6. **Relatórios** (`RelatoriosPage` + sub-componentes)
   - Mantém Recharts (compatível com Tailwind), envolve gráficos em `<Card>`, usa `<Tabs>` para navegação

7. **Dashboard** (`DashboardPage` + todos os cards)
   - Grid responsivo com `<Card>` shadcn, `<Skeleton>` para loading

**Ao finalizar a Camada 4:** remover `src/styles/main.css` completamente.

---

## Verificação por Camada

### Camada 1
- `npm run dev` sobe sem erro no console
- Inspecionar `<html>` no DevTools: atributo `data-theme` presente e alternando ao usar o toggle
- Verificar que `--primary` no `:root` tem valor HSL correto para cada tema
- Nenhuma mudança visual nas páginas existentes

### Camada 2
- Testar em viewport 375px (mobile): header + conteúdo + bottom nav visíveis, sem scroll horizontal na BottomNav
- Testar em viewport 1280px (desktop): sidebar visível, bottom nav oculta, conteúdo ocupa o restante
- Navegar entre as 5 rotas em ambos viewports
- Alternar tema: cores da sidebar e bottom nav refletem o tema ativo

### Camada 3
- Abrir cada página e verificar que botões, inputs, selects e modals renderizam com visual shadcn
- Testar Dialog: abre e fecha corretamente, foco gerenciado (acessibilidade)
- Testar Toast/Sonner: aparece ao salvar um item
- Testar AlertDialog: aparece ao excluir, com confirmação
- Verificar ambos os temas em cada componente base

### Camada 4
- Executar CRUD completo em cada módulo: criar, editar, excluir
- Verificar filtros (tabs Empresa/Pessoal/Ambos) em Cartões e Lançamentos
- Verificar DatePicker funciona e retorna data no formato correto para o Supabase
- Relatórios: gráficos Recharts renderizam dentro dos Cards
- Dashboard: Skeleton aparece durante loading, dados carregam corretamente
- `main.css` removido: nenhum estilo legado restante no bundle (`npm run build` sem warnings de CSS)

---

## Compatibilidade

- **Recharts:** compatível com Tailwind, sem alterações necessárias
- **Supabase:** sem impacto — camada de dados não muda
- **React Router:** sem impacto — apenas componentes de navegação mudam
- **date-fns:** sem impacto — lógica de datas não muda
- **react-day-picker:** instalado automaticamente pelo `npx shadcn add calendar`
