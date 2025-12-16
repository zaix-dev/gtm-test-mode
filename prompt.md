Olá! Meu objetivo é criar um pacote NPM chamado "@zaix/gtm-test-mode" e publicá-lo no npm sob meu nome de usuário "zaix".

Este pacote fornecerá um "modo de teste" para aplicações React e Next.js, permitindo que os desenvolvedores testem eventos do Google Tag Manager (GTM) sem disparar as ações de conversão reais, como redirecionamentos ou envios de formulário.

Siga exatamente as instruções abaixo para criar a estrutura e o conteúdo dos arquivos do pacote.

**TODO List:**

1.  Criar o arquivo `package.json` com as dependências, scripts e metadados corretos.
2.  Configurar o TypeScript com um `tsconfig.json` apropriado para a construção de uma biblioteca.
3.  Configurar o `tsup` como nosso bundler para criar os artefatos de distribuição (`cjs`, `esm` e `d.ts`). Crie o arquivo `tsup.config.ts`.
4.  Criar o código-fonte principal:
    *   O hook `useTestMode.tsx`.
    *   O componente `TestModeManager.tsx`.
    *   O ponto de entrada `index.ts` que exporta os módulos acima.
5.  Criar um arquivo `.gitignore` para ignorar `node_modules` e o diretório `dist`.
6.  Criar um arquivo `README.md` detalhado com instruções de instalação e uso.

---

**Instruções Detalhadas por Arquivo:**

**1. `package.json`**

Crie o arquivo `package.json` com o seguinte conteúdo. Note que `react` é uma `peerDependency`, o que é uma boa prática para bibliotecas React.

```json
{
  "name": "@zaix/gtm-test-mode",
  "version": "1.0.0",
  "description": "Um hook e componente React para habilitar um modo de teste para o GTM, permitindo validar eventos sem executar as ações de conversão.",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "lint": "eslint . --ext .ts,.tsx",
    "prepublishOnly": "npm run build"
  },
  "author": "zaix",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/zaix/gtm-test-mode.git"
  },
  "keywords": [
    "react",
    "nextjs",
    "gtm",
    "google-tag-manager",
    "testing",
    "analytics"
  ],
  "peerDependencies": {
    "react": ">=17.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^13.5.2",
    "react": "^18.0.0",
    "tsup": "^7.2.0",
    "typescript": "^5.2.2"
  }
}
```

**2. `tsconfig.json`**

Crie o arquivo `tsconfig.json` para compilar o TypeScript.

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "dist",
    "sourceMap": true,
    "declarationMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**3. `tsup.config.ts`**

Crie o arquivo `tsup.config.ts` para configurar o bundler.

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react'], // Marcar React como externo
});
```

**4. Código-fonte (dentro da pasta `src`)**

**a. `src/useTestMode.tsx`**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_STORAGE_KEY = "testModeActive";

export const useTestMode = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    try {
      const storedValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
      setIsActive(storedValue === "true");
    } catch (error) {
      console.error("GTM Test Mode: Could not access sessionStorage.", error);
    }
  }, []);

  const handleStorageChange = useCallback(() => {
    try {
      const storedValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
      setIsActive(storedValue === "true");
    }
    catch (error) {
      console.error("GTM Test Mode: Could not access sessionStorage.", error);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("testModeChange", handleStorageChange);
    return () => {
      window.removeEventListener("testModeChange", handleStorageChange);
    };
  }, [handleStorageChange]);

  const setTestMode = (enabled: boolean) => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, String(enabled));
      window.dispatchEvent(new Event("testModeChange"));
    } catch (error) {
      console.error("GTM Test Mode: Could not access sessionStorage.", error);
    }
  };

  const enableTestMode = () => setTestMode(true);
  const disableTestMode = () => setTestMode(false);

  return { isTestModeActive: isActive, enableTestMode, disableTestMode };
};
```

**b. `src/TestModeManager.tsx`**

Este componente agora aceita uma prop `onIntercept` para ser mais genérico e não depender de um sistema de `toast` específico.

```typescript
"use client";

import React, { useEffect, type FC, type ReactNode } from "react";
import { useTestMode } from "./useTestMode";

interface TestModeManagerProps {
  children?: ReactNode;
}

const TestModeBanner: FC = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      backgroundColor: "red",
      color: "white",
      textAlign: "center",
      padding: "8px 0",
      zIndex: 9999,
      fontSize: "1rem",
      fontWeight: "bold",
    }}
  >
    GTM TEST MODE ACTIVE
  </div>
);

export const TestModeManager: FC<TestModeManagerProps> = ({ children }) => {
  const { isTestModeActive, enableTestMode, disableTestMode } = useTestMode();

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).enableTestMode = () => {
        enableTestMode();
        console.log(
          "GTM Test Mode: ENABLED. Redirects will be blocked."
        );
      };
      (window as any).disableTestMode = () => {
        disableTestMode();
        console.log("GTM Test Mode: DISABLED. Normal behavior restored.");
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).enableTestMode;
        delete (window as any).disableTestMode;
      }
    };
  }, [enableTestMode, disableTestMode]);

  return (
    <>
      {isTestModeActive && <TestModeBanner />}
      {children}
    </>
  );
};
```

**c. `src/index.ts`**

```typescript
export { useTestMode } from './useTestMode';
export { TestModeManager } from './TestModeManager';
```

**5. `.gitignore`**

Crie o arquivo `.gitignore`.

```
# Dependencies
/node_modules

# Build output
/dist

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# IDE specific
.idea
.vscode
```

**6. `README.md`**

Crie um `README.md` com as seguintes instruções de uso.

````markdown
# @zaix/gtm-test-mode

Um hook e um componente React para habilitar um "modo de teste" para o Google Tag Manager (GTM).

Quando ativado, este pacote intercepta eventos (como cliques ou submissões de formulário) para prevenir o comportamento padrão (ex: redirecionamento), permitindo que você valide o envio de eventos GTM no modo de pré-visualização sem executar a ação de conversão final.

## Funcionalidades

-   Ative e desative o modo de teste através do console do navegador (`window.enableTestMode()`).
-   Estado persiste no `sessionStorage`, mantendo-se ativo durante a sessão de navegação.
-   Exibe um banner de aviso visual quando o modo está ativo.
-   Hook `useTestMode` para controlar a lógica de interceptação em seus componentes.

## Instalação

```bash
npm install @zaix/gtm-test-mode
# ou
yarn add @zaix/gtm-test-mode
# ou
pnpm add @zaix/gtm-test-mode
```

## Como Usar

### 1. Envolva sua aplicação com o `TestModeManager`

No arquivo principal da sua aplicação (como `_app.tsx` ou `layout.tsx` no Next.js), envolva seus componentes com `TestModeManager`.

```tsx
// Ex: em src/app/layout.tsx
import { TestModeManager } from '@zaix/gtm-test-mode';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TestModeManager />
        {/* O resto da sua aplicação */}
        {children}
      </body>
    </html>
  );
}
```

### 2. Use o hook `useTestMode` em seus componentes

Em qualquer componente onde você precise interceptar uma ação, use o hook `useTestMode`.

```tsx
"use client";

import { useTestMode } from '@zaix/gtm-test-mode';
import { useToast } from '@/hooks/use-toast'; // Seu próprio hook de toast
import { triggerGTMEvent } from '@/lib/gtm'; // Sua própria função de GTM

export function MeuBotaoDeConversao() {
  const { isTestModeActive } = useTestMode();
  const { toast } = useToast();

  const handleClick = (event: React.MouseEvent) => {
    // Dispare o evento GTM em ambos os modos
    triggerGTMEvent({ event: 'minha_conversao' });

    if (isTestModeActive) {
      // Previne a ação padrão (ex: navegar para outra página)
      event.preventDefault();

      // Fornece feedback ao usuário de que a ação foi bloqueada
      console.log('MODO DE TESTE: Navegação bloqueada.');
      toast({
        title: 'Modo de Teste Ativo',
        description: 'A navegação foi bloqueada.',
        variant: 'destructive',
      });
      return;
    }
    
    // Lógica de navegação normal aqui
    // Ex: router.push('/obrigado');
  };

  return <button onClick={handleClick}>Finalizar Compra</button>;
}
```

### 3. Controle pelo Console

Abra o console do desenvolvedor do seu navegador para ativar ou desativar o modo de teste.

```js
// Para ativar
window.enableTestMode();

// Para desativar
window.disableTestMode();
```

## Licença

MIT © [zaix](https://github.com/zaix)
````