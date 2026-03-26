# shadcn/ui Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o app VA Studio Financeiro de CSS puro customizado para Tailwind CSS v4 + shadcn/ui, com dois temas globais (Empresa/Pessoal) e layout responsivo (mobile + desktop).

**Architecture:** Migração layer-by-layer em 4 camadas sequenciais: (1) infraestrutura Tailwind+shadcn, (2) layout responsivo, (3) componentes UI base, (4) páginas e features. Cada camada tem seu próprio branch git e é verificada antes de avançar.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui, Lucide React, Supabase, Recharts, date-fns

**Spec:** `docs/superpowers/specs/2026-03-13-shadcn-migration-design.md`

---

## Chunk 1: Camada 1 — Infraestrutura Tailwind + shadcn

### Task 1: Criar branch e instalar dependências

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Criar branch da Camada 1**

```bash
cd "d:/00_VA_Studio/Financeiro VA"
git checkout -b feat/shadcn-layer-1-infra
```

- [ ] **Step 2: Instalar Tailwind CSS v4, plugin Vite e Lucide**

```bash
npm install tailwindcss @tailwindcss/vite lucide-react
npm install -D @types/node
```

Não instalar `autoprefixer` nem `postcss` — incompatíveis com Tailwind v4.
`lucide-react` pode ser reinstalado pelo `shadcn init` — isso é seguro, apenas garante que está disponível antes.

- [ ] **Step 3: Atualizar `vite.config.js`**

Ler o `vite.config.js` atual para ver o conteúdo exato. Então atualizar incluindo o plugin Tailwind **e** o alias `@` (necessário para imports `@/components/ui/...`):

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

> Usar `resolve` (named import) em vez de `import path from 'path'` para consistência com o padrão existente do projeto.

- [ ] **Step 4: Verificar que o servidor sobe sem erro**

```bash
npm run dev
```

Esperado: servidor rodando em `http://localhost:5173` sem erro no terminal.

---

### Task 2: Inicializar shadcn

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Modify: `src/styles/globals.css` (gerado pelo shadcn, será sobrescrito no Task 3)

- [ ] **Step 1: Executar shadcn init**

```bash
npx shadcn@latest init
```

Durante o wizard, selecionar:
- Style: **Default**
- Base color: **Slate** (será sobrescrito pelos temas customizados)
- CSS variables: **Yes**
- Quando perguntar sobre paths, usar:
  - Components: `src/components/ui`
  - Utils: `src/lib/utils`

- [ ] **Step 2: Verificar qual arquivo CSS o `shadcn init` criou**

O `shadcn init` pode ter criado o CSS em locais diferentes dependendo da versão. Verificar:

```bash
ls src/styles/ src/ app/ 2>/dev/null | grep -E "globals|index"
```

Localizar o arquivo gerado (pode ser `src/index.css`, `src/styles/globals.css`, `app/globals.css`, ou outro). Se **não** for `src/styles/globals.css`, mover ou anotar o caminho — o Task 3 vai sobrescrever `src/styles/globals.css`, que deve ser o arquivo importado em `main.jsx`.

Se o arquivo gerado estiver em outro local, atualizar o import em `main.jsx` para apontar para `src/styles/globals.css` (o Task 6 fará isso explicitamente).

- [ ] **Step 3: Deletar arquivos de configuração v3 gerados (se existirem)**

```bash
rm -f postcss.config.js postcss.config.cjs tailwind.config.ts tailwind.config.js
```

Esses arquivos são para Tailwind v3 e são incompatíveis com v4.

- [ ] **Step 4: Verificar `components.json`**

Abrir `components.json` e confirmar que `aliases.utils` aponta para `@/lib/utils` e `aliases.components` para `@/components/ui`.

- [ ] **Step 4: Verificar `jsconfig.json` / `tsconfig.json` para alias `@`**

Se existir um `jsconfig.json` ou `tsconfig.json` no projeto, verificar se já tem o path alias. Se não tiver, adicionar em `jsconfig.json` (ou `tsconfig.app.json`):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Se não existir nenhum desses arquivos, criar `jsconfig.json` na raiz com o conteúdo acima. Isso garante que o editor/IDE resolva os imports `@/` corretamente.

---

### Task 3: Criar `globals.css` com sistema de temas

**Files:**
- Create/Overwrite: `src/styles/globals.css`

- [ ] **Step 1: Sobrescrever `src/styles/globals.css` com o sistema de temas**

O shadcn gerou um `globals.css` padrão — substituir completamente pelo conteúdo abaixo:

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

  /* Fallback tema empresa (evita flash antes de data-theme ser aplicado) */
  --primary: 210 60% 30%;
  --primary-foreground: 0 0% 100%;
  --secondary: 210 60% 95%;
  --secondary-foreground: 210 60% 30%;
  --accent: 210 60% 95%;
  --accent-foreground: 210 60% 30%;
  --ring: 210 60% 30%;
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 213 22% 10%;
  --sidebar-primary: 210 60% 30%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 210 60% 95%;
  --sidebar-accent-foreground: 210 60% 30%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 210 60% 30%;
}

/* Tema Empresa — azul */
[data-theme="empresa"] {
  --primary: 210 60% 30%;
  --primary-foreground: 0 0% 100%;
  --secondary: 210 60% 95%;
  --secondary-foreground: 210 60% 30%;
  --accent: 210 60% 95%;
  --accent-foreground: 210 60% 30%;
  --ring: 210 60% 30%;
  --sidebar-primary: 210 60% 30%;
  --sidebar-accent: 210 60% 95%;
  --sidebar-ring: 210 60% 30%;
}

/* Tema Pessoal — laranja */
[data-theme="pessoal"] {
  --primary: 18 100% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 18 100% 97%;
  --secondary-foreground: 18 100% 60%;
  --accent: 18 100% 97%;
  --accent-foreground: 18 100% 60%;
  --ring: 18 100% 60%;
  --sidebar-primary: 18 100% 60%;
  --sidebar-accent: 18 100% 97%;
  --sidebar-ring: 18 100% 60%;
}

/* Tailwind v4: registrar as cores customizadas de sidebar como utilities */
/* Sem isso, classes como bg-sidebar, text-sidebar-foreground não geram CSS */
@theme {
  --color-sidebar: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));
}

/* Base styles */
* {
  border-color: hsl(var(--border));
  box-sizing: border-box;
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: Inter, system-ui, sans-serif;
}
```

---

### Task 4: Adicionar script anti-flash ao `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar script inline em `index.html`**

Ler o `index.html` atual. Inserir o script **depois** das tags `<meta charset>` e `<meta name="viewport">`, mas **antes** de qualquer `<script type="module">`. O script deve ser o primeiro código JavaScript executado:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    (function() {
      var ctx = localStorage.getItem('va-contexto') || 'empresa';
      document.documentElement.setAttribute('data-theme', ctx);
    })();
  </script>
  <!-- restante do head: title, link, etc. -->
```

---

### Task 5: Renomear variáveis conflitantes em `main.css`

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Identificar e renomear variáveis CSS que colidem com shadcn**

Primeiro, ler `src/styles/main.css` inteiro para identificar quais variáveis CSS estão definidas. As variáveis do shadcn que podem colidir são: `--primary`, `--secondary`, `--background`, `--foreground`, `--card`, `--border`, `--input`, `--muted`, `--destructive`, `--radius` (sem sufixo), `--ring`, `--accent`, `--popover`.

Fazer busca das colisões reais no arquivo:

```bash
grep -n "^\s*--radius\|^\s*--primary\|^\s*--background\|^\s*--border\|^\s*--muted\|^\s*--destructive\|^\s*--input-height" src/styles/main.css
```

Para cada variável encontrada que colide, adicionar prefixo `--va-` nas **definições** E nos **usos** (`var(...)`). As colisões mais comuns esperadas são `--radius-sm/md/lg/full` e `--input-height`:

| Se existir | Renomear para |
|---|---|
| `--radius-sm` | `--va-radius-sm` |
| `--radius-md` | `--va-radius-md` |
| `--radius-lg` | `--va-radius-lg` |
| `--radius-full` | `--va-radius-full` |
| `--input-height` | `--va-input-height` |
| Qualquer `--primary`, `--background`, `--border`, `--muted`, `--destructive` se existirem | `--va-[nome]` |

Após as substituições, verificar que não restaram referências sem prefixo:

```bash
grep -n "var(--radius-\|var(--input-height\|var(--primary\|var(--background\|var(--border\|var(--muted\|var(--destructive" src/styles/main.css
```

Esperado: zero resultados.

---

### Task 6: Atualizar `main.jsx` e `AppWrapper.jsx`

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/components/Layout/AppWrapper.jsx`

- [ ] **Step 1: Atualizar imports em `src/main.jsx`**

`globals.css` deve ser importado **antes** de `main.css`:

```jsx
import './styles/globals.css'  // shadcn + Tailwind — deve vir primeiro
import './styles/main.css'     // legado — removido ao final da Camada 4
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 2: Ler `AppWrapper.jsx` e `App.jsx` para entender o gerenciamento de contexto**

Antes de modificar qualquer coisa, ler os dois arquivos. Identificar:
- Onde o estado `contexto` (Empresa/Pessoal) é criado (`useState`)
- Como ele é propagado para os componentes filhos (Context API, prop drilling, etc.)
- Se `AppWrapper` usa `children` ou `<Outlet>` do React Router

**Apenas depois de ler**, adicionar o `useEffect` no componente que detém o estado de contexto:

```jsx
// Adicionar no componente que tem o useState para contexto:
useEffect(() => {
  document.documentElement.setAttribute('data-theme', contexto);
  localStorage.setItem('va-contexto', contexto);
}, [contexto]);
```

Garantir que `useEffect` está importado do React. **Não reescrever** o AppWrapper inteiro aqui — isso é feito no Task 11.

- [ ] **Step 3: Verificar que o app sobe e o tema muda**

```bash
npm run dev
```

Abrir o browser, inspecionar `<html>` no DevTools → deve ter `data-theme="empresa"`.
Usar o toggle Empresa/Pessoal → `data-theme` deve mudar para `pessoal`.
Recarregar a página → o tema deve persistir (vindo do localStorage).

- [ ] **Step 4: Commit da Camada 1**

```bash
git add -A
git commit -m "feat: camada 1 — infraestrutura Tailwind v4 + shadcn + sistema de temas"
```

---

## Chunk 2: Camada 2 — Layout Responsivo

### Task 7: Criar branch e instalar componentes de layout

**Files:**
- Modify: `package.json` (dependências shadcn)

- [ ] **Step 1: Criar branch da Camada 2**

```bash
git checkout -b feat/shadcn-layer-2-layout
```

- [ ] **Step 2: Instalar componentes shadcn necessários para o layout**

```bash
npx shadcn@latest add separator
```

> `separator` é usado na `Sidebar` entre o logo e a navegação. Não instalar `sheet` — a sidebar desktop é sempre visível e não usa drawer.

---

### Task 8: Criar `Sidebar.jsx`

**Files:**
- Create/Overwrite: `src/components/Layout/Sidebar.jsx`

- [ ] **Step 1: Criar o componente Sidebar**

```jsx
// src/components/Layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  BarChart2,
  CreditCard,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ContextToggle from '../UI/ContextToggle'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/lancamentos', icon: ArrowLeftRight, label: 'Lançamentos' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
  { to: '/cartoes', icon: CreditCard, label: 'Cartões' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center h-14 px-6 border-b border-sidebar-border">
        <span className="font-bold text-lg text-sidebar-primary">VA Studio</span>
        <span className="ml-1 text-sm text-muted-foreground font-medium">Financeiro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Context Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <ContextToggle />
      </div>
    </aside>
  )
}
```

---

### Task 9: Atualizar `Header.jsx`

**Files:**
- Modify: `src/components/Layout/Header.jsx`

- [ ] **Step 1: Ler `Header.jsx` e identificar call sites**

Ler o arquivo atual. Verificar quais props ele aceita (ex: `title`, `rightAction`) e buscar onde é usado:

```bash
grep -rn "Header" src/ --include="*.jsx" --include="*.js"
```

Anotar os call sites — eles serão atualizados no Step 3.

- [ ] **Step 2: Reescrever Header com Tailwind**

O novo Header obtém o título via `useLocation()` (sem receber `title` como prop) e inclui `<Separator>` na borda inferior:

```jsx
// src/components/Layout/Header.jsx
import { useLocation } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import ContextToggle from '../UI/ContextToggle'

const pageTitles = {
  '/': 'Dashboard',
  '/lancamentos': 'Lançamentos',
  '/categorias': 'Categorias',
  '/relatorios': 'Relatórios',
  '/cartoes': 'Cartões',
  '/clientes': 'Clientes',
  '/contas': 'Contas',
}

export default function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'VA Studio'

  return (
    <div className="shrink-0">
      <header className="h-14 bg-card flex items-center justify-between px-4">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        <div className="md:hidden">
          <ContextToggle compact />
        </div>
      </header>
      <Separator />
    </div>
  )
}
```

- [ ] **Step 3: Atualizar call sites do Header**

Nos arquivos identificados no Step 1 que passam `title` ou `rightAction` para `<Header>`, remover essas props — o novo Header não as aceita e as ignoraria silenciosamente.

---

### Task 10: Atualizar `BottomNav.jsx`

**Files:**
- Modify: `src/components/UI/BottomNav.jsx`

- [ ] **Step 1: Reescrever BottomNav com Tailwind (fix do scroll horizontal)**

```jsx
// src/components/UI/BottomNav.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  BarChart2,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/lancamentos', icon: ArrowLeftRight, label: 'Lançamentos' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
  { to: '/cartoes', icon: CreditCard, label: 'Cartões' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-card border-t border-border z-50">
      <div className="flex h-full overflow-hidden">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate w-full text-center px-1">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

---

### Task 11: Atualizar `AppWrapper.jsx` com layout responsivo

**Files:**
- Modify: `src/components/Layout/AppWrapper.jsx`

- [ ] **Step 1: Ler `App.jsx`, `AppWrapper.jsx` e arquivos de contexto**

Antes de escrever qualquer código, ler:
- `src/App.jsx` — como as rotas são definidas, se AppWrapper é layout route
- `src/components/Layout/AppWrapper.jsx` — usa `children` ou `<Outlet>`?
- Qualquer arquivo em `src/hooks/` ou `src/contexts/` que gerencie o contexto Empresa/Pessoal

**Decisão com base na leitura:**
- Se AppWrapper já usa `<Outlet>` → apenas atualizar o JSX de layout
- Se usa `children` → converter para `<Outlet>` E atualizar `App.jsx` para usar AppWrapper como layout route
- Se o contexto vive em um Provider separado → mantê-lo onde está e não duplicar o state

- [ ] **Step 2: Reescrever AppWrapper com grid responsivo**

Com base no que foi lido no Step 1, reescrever o AppWrapper preservando o padrão de contexto existente e atualizando apenas o layout:

```jsx
// src/components/Layout/AppWrapper.jsx
// ADAPTAR conforme o padrão de contexto encontrado no Step 1
import { Outlet } from 'react-router-dom'  // ou manter children se necessário
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNav from '../UI/BottomNav'
// Importar Context Provider se o projeto usa — manter onde estava

export default function AppWrapper() {
  // Manter o gerenciamento de contexto exatamente como estava
  // (useEffect para data-theme já foi adicionado no Task 6 Step 2)

  return (
    // Se usa Context Provider, envolver o layout com ele aqui
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — apenas desktop */}
      <Sidebar />

      {/* Área principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4">
          <Outlet /> {/* ou {children} se não converteu para layout route */}
        </main>
      </div>

      {/* Bottom Nav — apenas mobile */}
      <BottomNav />
    </div>
  )
}
```

> `pb-16` (64px) no `<main>` evita que conteúdo fique atrás do BottomNav (64px de altura) no mobile. `md:pb-0` remove o padding no desktop.

- [ ] **Step 2: Verificar layout responsivo**

```bash
npm run dev
```

- Viewport 375px (DevTools mobile): header + conteúdo + bottom nav visíveis, sem scroll horizontal na BottomNav
- Viewport 1280px (DevTools desktop): sidebar visível na esquerda, bottom nav oculta
- Navegar entre as rotas em ambos viewports
- Alternar contexto: cores mudam em sidebar e bottom nav

- [ ] **Step 3: Commit da Camada 2**

```bash
git add -A
git commit -m "feat: camada 2 — layout responsivo com sidebar desktop e bottom nav mobile"
```

---

## Chunk 3: Camada 3 — Componentes UI Base

### Task 12: Instalar todos os componentes shadcn necessários

- [ ] **Step 1: Instalar componentes shadcn em lote**

```bash
npx shadcn@latest add button card dialog input label select badge tabs table skeleton alert-dialog sonner toggle-group popover calendar
```

Aguardar instalação completa. Todos os arquivos serão gerados em `src/components/ui/`.

> **Nota Sonner:** `npx shadcn add sonner` já instala o pacote `sonner` e gera `src/components/ui/sonner.jsx` (o wrapper `<Toaster />`). Não instalar `sonner` separadamente. O import correto para o componente visual é `import { Toaster } from '@/components/ui/sonner'`. O import para funções de toast (`toast()`, `toast.success()`, `toast.error()`) é `import { toast } from 'sonner'` (pacote raw) — ambos são exportações do mesmo pacote e coexistem corretamente.

---

### Task 13: Substituir `Button.jsx`

**Files:**
- Modify: `src/components/UI/Button.jsx`

- [ ] **Step 1: Reescrever Button como re-export do shadcn**

O botão shadcn já tem as variantes necessárias (default, outline, ghost, destructive, secondary). Substituir o componente customizado:

```jsx
// src/components/UI/Button.jsx
// Re-exporta o Button do shadcn com aliases de variante para compatibilidade
export { Button } from '@/components/ui/button'
export { default } from '@/components/ui/button'
```

> **Nota de migração:** Se outros componentes usam `<Button variant="primary">`, atualizar os chamadores para `variant="default"`. Se usam `variant="ghost"`, manter como está (o shadcn tem `ghost`).

---

### Task 14: Substituir `Card.jsx`

**Files:**
- Modify: `src/components/UI/Card.jsx`

- [ ] **Step 1: Reescrever Card como re-export do shadcn**

```jsx
// src/components/UI/Card.jsx
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
export { Card as default } from '@/components/ui/card'
```

---

### Task 15: Substituir `Modal.jsx`

**Files:**
- Modify: `src/components/UI/Modal.jsx`

- [ ] **Step 1: Reescrever Modal usando Dialog do shadcn**

O Modal atual provavelmente tem props como `isOpen`, `onClose`, `title`, `children`. Criar um wrapper compatível:

```jsx
// src/components/UI/Modal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function Modal({ isOpen, onClose, title, children, footer }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-4">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="py-2">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
```

> **Atenção:** Ler o `Modal.jsx` atual antes de escrever para verificar a interface de props exata e manter compatibilidade com todos os chamadores.

---

### Task 16: Substituir `Input.jsx`

**Files:**
- Modify: `src/components/UI/Input.jsx`

- [ ] **Step 1: Reescrever Input com shadcn Input + Label**

```jsx
// src/components/UI/Input.jsx
import { Input as ShadInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function Input({
  label,
  error,
  required,
  id,
  className,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <ShadInput
        id={inputId}
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)}
        {...props}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
```

---

### Task 17: Substituir `Select.jsx`

**Files:**
- Modify: `src/components/UI/Select.jsx`

- [ ] **Step 1: Reescrever Select com shadcn Select**

```jsx
// src/components/UI/Select.jsx
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function Select({ label, options = [], value, onChange, placeholder, required, id }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={selectId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <ShadSelect value={value} onValueChange={onChange}>
        <SelectTrigger id={selectId}>
          <SelectValue placeholder={placeholder || 'Selecionar...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value ?? opt} value={String(opt.value ?? opt)}>
              {opt.label ?? opt}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadSelect>
    </div>
  )
}
```

> **Atenção:** Ler o `Select.jsx` atual para verificar o formato do prop `options` (pode ser `{ label, value }` ou string simples) e garantir compatibilidade.

---

### Task 18: Substituir `Badge.jsx`

**Files:**
- Modify: `src/components/UI/Badge.jsx`

- [ ] **Step 1: Reescrever Badge como re-export do shadcn**

```jsx
// src/components/UI/Badge.jsx
export { Badge } from '@/components/ui/badge'
export { default } from '@/components/ui/badge'
```

---

### Task 19: Reconstruir `ContextToggle.jsx` com ToggleGroup

**Files:**
- Modify: `src/components/UI/ContextToggle.jsx`

- [ ] **Step 1: Ler o ContextToggle atual para entender como obtém e altera o contexto**

Verificar se usa Context API, prop drilling ou outro mecanismo.

- [ ] **Step 2: Reescrever com shadcn ToggleGroup**

```jsx
// src/components/UI/ContextToggle.jsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Building2, User } from 'lucide-react'
// Importar o hook/context que expõe contexto e setContexto — adaptar ao padrão atual
// import { useContexto } from '../../hooks/useContexto'

export default function ContextToggle({ compact = false }) {
  // const { contexto, setContexto } = useContexto()
  // Substituir pela forma atual de obter/setar contexto

  return (
    <ToggleGroup
      type="single"
      value={contexto}
      onValueChange={(val) => val && setContexto(val)}
      className="w-full"
    >
      <ToggleGroupItem
        value="empresa"
        className="flex-1 gap-1.5"
        aria-label="Contexto Empresa"
      >
        <Building2 size={14} />
        {!compact && <span>Empresa</span>}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="pessoal"
        className="flex-1 gap-1.5"
        aria-label="Contexto Pessoal"
      >
        <User size={14} />
        {!compact && <span>Pessoal</span>}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

---

### Task 20: Atualizar `ContextBadge.jsx`, `LoadingScreen.jsx`, `EmptyState.jsx`

**Files:**
- Modify: `src/components/UI/ContextBadge.jsx`
- Modify: `src/components/UI/LoadingScreen.jsx`
- Modify: `src/components/UI/EmptyState.jsx`

- [ ] **Step 1: Atualizar ContextBadge**

`variant="secondary"` já adapta as cores via CSS variables do tema ativo — não é necessário className adicional. O sistema de temas (`data-theme`) cuida da diferenciação visual automaticamente:

```jsx
// src/components/UI/ContextBadge.jsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function ContextBadge({ contexto, className }) {
  return (
    <Badge variant="secondary" className={cn(className)}>
      {contexto === 'empresa' ? 'Empresa' : 'Pessoal'}
    </Badge>
  )
}
```

- [ ] **Step 2: Atualizar LoadingScreen com Skeleton**

```jsx
// src/components/UI/LoadingScreen.jsx
import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingScreen() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Atualizar EmptyState com Tailwind**

```jsx
// src/components/UI/EmptyState.jsx
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon size={28} className="text-muted-foreground" />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
```

- [ ] **Step 4: Adicionar Toaster do Sonner ao App**

Em `src/App.jsx` ou `src/main.jsx`, adicionar o `<Toaster />` do Sonner:

```jsx
import { Toaster } from 'sonner'

// dentro do JSX raiz, após os providers:
<Toaster richColors position="top-center" />
```

- [ ] **Step 5: Verificar componentes base no browser**

```bash
npm run dev
```

Navegar por algumas páginas e verificar:
- Botões renderizam com estilo shadcn
- Modais/Dialogs abrem e fecham corretamente
- Inputs e Selects funcionam
- ContextToggle alterna entre Empresa e Pessoal
- Ambos os temas aplicam cores corretas nos componentes

- [ ] **Step 6: Commit da Camada 3**

```bash
git add -A
git commit -m "feat: camada 3 — componentes UI base migrados para shadcn"
```

---

## Chunk 4: Camada 4 — Páginas (Cartões, Categorias, Contas, Clientes)

### Task 21: Migrar Cartões

**Files:**
- Modify: `src/pages/CartoesPage.jsx`
- Modify: `src/components/Cartoes/CartaoItem.jsx`
- Modify: `src/components/Cartoes/NovoCartao.jsx`

- [ ] **Step 1: Ler os três arquivos de Cartões**

Ler cada arquivo para entender a estrutura atual antes de modificar.

- [ ] **Step 2: Migrar `CartoesPage.jsx`**

Substituir estrutura de layout e filtros. O filtro "Todos" deve virar "Ambos":

```jsx
// Exemplo de estrutura esperada — adaptar ao código real
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

// No filtro de contexto, substituir "Todos" por "Ambos":
<Tabs value={filtro} onValueChange={setFiltro}>
  <TabsList>
    <TabsTrigger value="ambos">Ambos</TabsTrigger>
    <TabsTrigger value="empresa">Empresa</TabsTrigger>
    <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
  </TabsList>
</Tabs>
```

> Adaptar o valor padrão do filtro de `'todos'` para `'ambos'` na lógica de filtragem.

- [ ] **Step 3: Migrar `CartaoItem.jsx`**

Usar `<Card>` shadcn, `<Badge>` para limite/status, `<Button>` variant="ghost" para ações.

- [ ] **Step 4: Migrar `NovoCartao.jsx`**

Usar `<Dialog>` shadcn ao invés do `<Modal>` customizado, com `<Input>` e `<Select>` do shadcn para os campos.

- [ ] **Step 5: Verificar página de Cartões**

- CRUD completo: criar, editar, excluir cartão
- Filtro "Ambos" mostra todos; "Empresa" e "Pessoal" filtram corretamente
- Modal abre e fecha, formulário salva no Supabase

---

### Task 22: Migrar Categorias

**Files:**
- Modify: `src/pages/CategoriasPage.jsx`
- Modify: `src/components/Categorias/NovaCategoria.jsx`

- [ ] **Step 1: Ler arquivos de Categorias**

- [ ] **Step 2: Migrar `CategoriasPage.jsx`**

Usar `<Card>` para cada categoria, `<Badge>` para tipo, `<Button>` para ações. Layout em grid ou lista com Tailwind.

- [ ] **Step 3: Migrar `NovaCategoria.jsx`**

Substituir modal customizado por `<Dialog>` shadcn com `<Input>` shadcn.

- [ ] **Step 4: Verificar página de Categorias**

CRUD completo funciona, sem erros no console.

---

### Task 23: Migrar Contas

**Files:**
- Modify: `src/pages/ContasPage.jsx`
- Modify: `src/components/Contas/ContaItem.jsx`
- Modify: `src/components/Contas/NovaDespesaFixa.jsx`
- Modify: `src/components/Contas/ListaDespesasFixas.jsx`

- [ ] **Step 1: Ler arquivos de Contas**

- [ ] **Step 2: Migrar `ContasPage.jsx`**

Ler o arquivo. Substituir container principal por Tailwind, adicionar `<Button>` shadcn para abrir formulário de nova conta/despesa. Estrutura geral:

```jsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold">Contas</h2>
    <Button size="sm" onClick={...}><Plus size={16} className="mr-1" />Nova Conta</Button>
  </div>
  {/* lista de ContaItem */}
  {/* ListaDespesasFixas */}
</div>
```

- [ ] **Step 3: Migrar `ContaItem.jsx`**

Usar `<Card>` shadcn com `<CardHeader>`, `<CardContent>`.

- [ ] **Step 3: Migrar `ListaDespesasFixas.jsx`**

Usar `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>` do shadcn.

- [ ] **Step 4: Migrar formulários com `<Dialog>`**

`NovaDespesaFixa.jsx`: substituir modal por `<Dialog>` shadcn.

- [ ] **Step 5: Verificar página de Contas**

CRUD completo funciona, tabela exibe despesas fixas corretamente.

---

### Task 24: Migrar Clientes

**Files:**
- Modify: `src/pages/ClientesPage.jsx`
- Modify: `src/components/Clientes/ClienteItem.jsx`
- Modify: `src/components/Clientes/ListaClientes.jsx`
- Modify: `src/components/Clientes/NovoCliente.jsx`
- Modify: `src/components/Clientes/GestaoNF.jsx`

- [ ] **Step 1: Ler arquivos de Clientes**

- [ ] **Step 2: Migrar lista com `<Table>`**

`ListaClientes.jsx`: usar `<Table>` do shadcn para exibir clientes.

- [ ] **Step 3: Migrar `GestaoNF.jsx`**

Usar `<Tabs>` shadcn para navegação entre seções de NF.

- [ ] **Step 4: Migrar formulário `NovoCliente.jsx`**

Substituir modal por `<Dialog>` shadcn.

- [ ] **Step 5: Verificar página de Clientes**

CRUD completo funciona, tabs de NF funcionam.

- [ ] **Step 6: Commit da Camada 4a**

```bash
git add -A
git commit -m "feat: camada 4a — páginas Cartões, Categorias, Contas e Clientes migradas"
```

---

## Chunk 5: Camada 4 — Páginas (Lançamentos, Relatórios, Dashboard) + Cleanup

### Task 25: Migrar Lançamentos

**Files:**
- Modify: `src/pages/LancamentosPage.jsx`
- Modify: `src/components/Lancamentos/LancamentoItem.jsx`
- Modify: `src/components/Lancamentos/ListaLancamentos.jsx`
- Modify: `src/components/Lancamentos/NovoLancamento.jsx`

- [ ] **Step 1: Ler arquivos de Lançamentos**

- [ ] **Step 2: Migrar `ListaLancamentos.jsx`**

Usar `<Table>` shadcn. Filtros via `<Select>` shadcn (período, tipo, categoria, contexto).

- [ ] **Step 3: Implementar DatePicker em `NovoLancamento.jsx`**

Extrair DatePicker para `src/components/UI/DatePicker.jsx` — pode ser reutilizado em outros formulários do projeto:

```jsx
// src/components/UI/DatePicker.jsx
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export default function DatePicker({ value, onChange, label }) {
  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

Em `NovoLancamento.jsx`, importar e usar:
```jsx
import DatePicker from '@/components/UI/DatePicker'
```

- [ ] **Step 4: Adicionar feedback Sonner em NovoLancamento**

```jsx
import { toast } from 'sonner'

// Ao salvar com sucesso:
toast.success('Lançamento salvo!')

// Em caso de erro:
toast.error('Erro ao salvar lançamento.')
```

- [ ] **Step 5: Adicionar AlertDialog para exclusão**

```jsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Substituir o confirm() nativo por AlertDialog
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="sm">Excluir</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- [ ] **Step 6: Verificar página de Lançamentos**

- Tabela exibe lançamentos
- Filtros funcionam
- DatePicker seleciona data e retorna no formato correto para o Supabase (`YYYY-MM-DD`)
- Toast aparece ao salvar e ao ocorrer erro
- AlertDialog aparece ao excluir

---

### Task 26: Migrar Relatórios

**Files:**
- Modify: `src/pages/RelatoriosPage.jsx`
- Modify: `src/components/Relatorios/FluxoMensal.jsx`
- Modify: `src/components/Relatorios/GastosPorCategoria.jsx`
- Modify: `src/components/Relatorios/HistoricoCompleto.jsx`
- Modify: `src/components/Relatorios/RelatorioNF.jsx`

- [ ] **Step 1: Ler arquivos de Relatórios**

- [ ] **Step 2: Migrar `RelatoriosPage.jsx`**

Usar `<Tabs>` shadcn para navegar entre os tipos de relatório (Fluxo Mensal, Gastos por Categoria, Histórico, NF):

```jsx
<Tabs defaultValue="fluxo">
  <TabsList className="grid grid-cols-4 w-full">
    <TabsTrigger value="fluxo">Fluxo</TabsTrigger>
    <TabsTrigger value="categorias">Categorias</TabsTrigger>
    <TabsTrigger value="historico">Histórico</TabsTrigger>
    <TabsTrigger value="nf">NF</TabsTrigger>
  </TabsList>
  <TabsContent value="fluxo"><FluxoMensal /></TabsContent>
  <TabsContent value="categorias"><GastosPorCategoria /></TabsContent>
  <TabsContent value="historico"><HistoricoCompleto /></TabsContent>
  <TabsContent value="nf"><RelatorioNF /></TabsContent>
</Tabs>
```

- [ ] **Step 3: Envolver gráficos Recharts em `<Card>`**

Em cada componente de relatório, envolver o gráfico:

```jsx
<Card>
  <CardHeader>
    <CardTitle>Fluxo Mensal</CardTitle>
  </CardHeader>
  <CardContent>
    {/* gráfico Recharts existente sem alteração */}
    <ResponsiveContainer width="100%" height={300}>
      ...
    </ResponsiveContainer>
  </CardContent>
</Card>
```

- [ ] **Step 4: Verificar página de Relatórios**

- Tabs navegam entre relatórios
- Gráficos Recharts renderizam dentro dos Cards
- Dados carregam do Supabase corretamente

---

### Task 27: Migrar Dashboard

**Files:**
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/components/Dashboard/MetricasDashboard.jsx`
- Modify: `src/components/Dashboard/SaldoCard.jsx`
- Modify: `src/components/Dashboard/ClientesReceberCard.jsx`
- Modify: `src/components/Dashboard/EvolucaoGastosCard.jsx`
- Modify: `src/components/Dashboard/LimiteDiarioCard.jsx`
- Modify: `src/components/Dashboard/PrincipaisCategoriasCard.jsx`
- Modify: `src/components/Dashboard/ProximosVencimentosCard.jsx`
- Modify: `src/components/Dashboard/UltimasTransacoesCard.jsx`

- [ ] **Step 1: Ler arquivos de Dashboard**

- [ ] **Step 2: Ler `DashboardPage.jsx` e `MetricasDashboard.jsx` para entender a composição atual**

Verificar quais cards `MetricasDashboard` já agrega (provavelmente `SaldoCard`, `ClientesReceberCard`, `LimiteDiarioCard`) e quais ficam no nível da página. Então atualizar para grid responsivo:

```jsx
<div className="space-y-4">
  {/* Cards de métricas rápidas — SaldoCard, ClientesReceberCard, LimiteDiarioCard */}
  <MetricasDashboard />

  {/* Cards de gráficos e listas */}
  <div className="grid gap-4 md:grid-cols-2">
    <EvolucaoGastosCard />
    <PrincipaisCategoriasCard />
  </div>
  <div className="grid gap-4 md:grid-cols-2">
    <UltimasTransacoesCard />
    <ProximosVencimentosCard />
  </div>
</div>
```

> Adaptar com base na estrutura real encontrada — `SaldoCard`, `ClientesReceberCard` e `LimiteDiarioCard` podem estar dentro de `MetricasDashboard` ou no nível da página. Não assumir — ler o código atual.

- [ ] **Step 3: Migrar cada card do Dashboard**

Para cada card (`SaldoCard`, `ClientesReceberCard`, etc.):
- Envolver em `<Card>` shadcn com `<CardHeader>` e `<CardContent>`
- Usar `<Skeleton>` durante loading:

```jsx
import { Skeleton } from '@/components/ui/skeleton'

if (loading) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Verificar Dashboard**

- Skeleton aparece durante carregamento
- Dados carregam e exibem corretamente
- Grid responsivo: 1 coluna no mobile, 2 no desktop

---

### Task 28: Cleanup — Remover `main.css` e estilos legados

**Files:**
- Delete: `src/styles/main.css`
- Modify: `src/main.jsx`

- [ ] **Step 1: Verificar que não há mais referências a classes CSS de `main.css`**

Fazer uma busca global no projeto por classes CSS customizadas do antigo design system (ex: `btn--primary`, `card--empresa`, `modal-overlay`):

```bash
grep -r "btn--\|card--\|modal-overlay\|bottom-nav\|context-toggle\|va-badge" src/ --include="*.jsx" --include="*.js"
```

Se encontrar resultados, atualizar esses componentes antes de remover `main.css`.

- [ ] **Step 2: Remover import de `main.css` em `main.jsx`**

```jsx
// src/main.jsx — remover esta linha:
// import './styles/main.css'
```

- [ ] **Step 3: Verificar app sem `main.css`**

```bash
npm run dev
```

Navegar por todas as páginas e verificar que não há visual quebrado.

- [ ] **Step 4: Deletar `main.css`**

```bash
rm src/styles/main.css
```

- [ ] **Step 5: Build de produção sem warnings de CSS**

```bash
npm run build
```

Esperado: build completo sem erros ou warnings relacionados a CSS.

- [ ] **Step 6: Commit final da Camada 4**

```bash
git add -A
git commit -m "feat: camada 4 — todas as páginas migradas para shadcn, main.css removido"
```

---

## Verificação Final

- [ ] Testar em viewport 375px: todas as 6 rotas funcionam, bottom nav sem scroll horizontal
- [ ] Testar em viewport 1280px: sidebar visível, layout de 2 colunas no dashboard
- [ ] Alternar tema Empresa → Pessoal → Empresa: cores mudam em todos os componentes
- [ ] Recarregar página: tema persiste (localStorage)
- [ ] CRUD em cada módulo: Lançamentos, Cartões, Categorias, Contas, Clientes
- [ ] `npm run build` sem erros
