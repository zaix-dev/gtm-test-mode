# @zaix/gtm-test-mode

A React hook and component to enable a "test mode" for Google Tag Manager (GTM).

When activated, this package intercepts events (like clicks or form submissions) to prevent the default behavior (e.g., redirection), allowing you to validate the dispatch of GTM events in preview mode without executing the final conversion action.

## Features

-   Activate and deactivate test mode through the browser console (`window.enableTestMode()`).
-   State persists in `sessionStorage`, remaining active during the browsing session.
-   Displays a visual warning banner when the mode is active.
-   `useTestMode` hook to control interception logic in your components.

## Installation

```bash
npm install @zaix/gtm-test-mode
# or
yarn add @zaix/gtm-test-mode
# or
pnpm add @zaix/gtm-test-mode
```

## How to Use

### 1. Wrap your application with `TestModeManager`

In your application's main file (like `_app.tsx` or `layout.tsx` in Next.js), wrap your components with `TestModeManager`.

```tsx
// Ex: in src/app/layout.tsx
import { TestModeManager } from '@zaix/gtm-test-mode';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TestModeManager />
        {/* The rest of your application */}
        {children}
      </body>
    </html>
  );
}
```

### 2. Use the `useTestMode` hook in your components

In any component where you need to intercept an action, use the `useTestMode` hook.

```tsx
"use client";

import { useTestMode } from '@zaix/gtm-test-mode';
import { useToast } from '@/hooks/use-toast'; // Your own toast hook
import { triggerGTMEvent } from '@/lib/gtm'; // Your own GTM function

export function MyConversionButton() {
  const { isTestModeActive } = useTestMode();
  const { toast } = useToast();

  const handleClick = (event: React.MouseEvent) => {
    // Trigger the GTM event in both modes
    triggerGTMEvent({ event: 'my_conversion' });

    if (isTestModeActive) {
      // Prevents the default action (e.g., navigating to another page)
      event.preventDefault();

      // Provides feedback to the user that the action was blocked
      console.log('TEST MODE: Navigation blocked.');
      toast({
        title: 'Test Mode Active',
        description: 'Navigation has been blocked.',
        variant: 'destructive',
      });
      return;
    }
    
    // Normal navigation logic here
    // Ex: router.push('/thank-you');
  };

  return <button onClick={handleClick}>Complete Purchase</button>;
}
```

### 3. Control via the Console

Open your browser's developer console to activate or deactivate test mode.

```js
// To activate
window.enableTestMode();

// To deactivate
window.disableTestMode();
```

## License

MIT © [zaix](https://github.com/zaix-dev)
