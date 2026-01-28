# @nardole/mui-dynamic-dialog

A tiny, flexible dynamic dialog system for React + MUI (Material UI). Quickly open confirmation or custom dialogs from anywhere in your app using a Provider and a simple hook.

- Framework: React 18+
- UI: MUI v7
- Language: TypeScript
- Bundler: Vite

## Features

- Open dialogs programmatically from anywhere
- Fully typed options and slots (override MUI components or provide your own)
- Default confirm/cancel actions, texts, and order
- Per-dialog or global defaults via Provider

## Installation

Install via your favorite package manager:

```bash
# npm
npm install @nardole/material-ui-dynamic-dialog

# yarn
yarn add @nardole/material-ui-dynamic-dialog

# pnpm
pnpm add @nardole/material-ui-dynamic-dialog
```

Peer dependencies you must have in your app:

- react, react-dom (>=18)
- @mui/material (>=7)

## Quick Start

Wrap your application with the provider once (usually near the root):

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import { DynamicDialogProvider } from "@nardole/material-ui-dynamic-dialog";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DynamicDialogProvider>
        <App />
      </DynamicDialogProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
```

Open a dialog from anywhere using the hook:

```tsx
import { Button } from "@mui/material";
import { useDynamicDialog } from "@nardole/material-ui-dynamic-dialog";

export function Example() {
  const { dialog } = useDynamicDialog();

  const handleClick = () => {
    const { id, close } = dialog({
      title: "Delete item",
      content:
        "Are you sure you want to delete this item? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => {
        // perform delete
        console.log("confirmed", id);
      },
      onCancel: () => console.log("canceled", id),
    });

    // You can later close it programmatically if needed:
    // close();
  };

  return <Button onClick={handleClick}>Open Dialog</Button>;
}
```

## API

### Provider

Props for `<DynamicDialogProvider />`:

| Prop            | Type                 | Default | Description                                                          |
| --------------- | -------------------- | ------- | -------------------------------------------------------------------- |
| defaultOptions? | DynamicDialogOptions | —       | Options applied globally to every dialog unless overridden per call. |

### Hook

`useDynamicDialog()` returns an API object:

| Member         | Signature                                               | Returns                           | Description                                                               |
| -------------- | ------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| dialog         | (options: DynamicDialogOptions)                         | { id: string; close: () => void } | Opens a new dialog with the provided options and returns id and close fn. |
| close          | (id: string, reason?: 'confirm' \| 'cancel' \| 'close') | void                              | Closes a dialog by id. Reason is optional and used by callbacks/guards.   |
| remove         | (id: string)                                            | void                              | Immediately removes a dialog node by id (usually `close` is preferred).   |
| defaultOptions | —                                                       | DynamicDialogOptions \| undefined | Provider-level default options (if set).                                  |

### Options

`DynamicDialogOptions` (defaults in parentheses):

| Name                       | Type                                                              | Default                | Description                                                                  |
| -------------------------- | ----------------------------------------------------------------- |------------------------| ---------------------------------------------------------------------------- |
| title?                     | React.ReactNode                                                   | (null)                 | Dialog title content.                                                        |
| content?                   | React.ReactNode                                                   | (null)                 | Dialog body content.                                                         |
| confirmText?               | string                                                            | "Confirm"              | Label for the confirm button.                                                |
| cancelText?                | string                                                            | "Cancel"               | Label for the cancel button.                                                 |
| slots?.Dialog?             | React.ComponentType<DialogProps>                                  | MUI Dialog             | Root dialog component to render.                                             |
| slotsProps?.dialog?        | Omit<React.ComponentProps<DialogComponent>, 'open'>               | {}                     | Props for slots.Dialog (except `open`, which is controlled).                 |
| slots?.DialogTitle?        | React.ComponentType<DialogTitleProps>                             | MUI DialogTitle        | Component for title area.                                                    |
| slotsProps?.dialogTitle?   | React.ComponentProps<DialogTitleComponent>                        | {}                     | Props for slots.DialogTitle.                                                 |
| slots?.DialogContent?      | React.ComponentType<DialogContentProps>                           | MUI DialogContent      | Component for content area.                                                  |
| slotsProps?.dialogContent? | React.ComponentProps<DialogContentComponent>                      | {}                     | Props for slots.DialogContent.                                               |
| slots?.DialogActions?      | React.ComponentType<DialogActionsProps>                           | MUI DialogActions      | Component for actions area.                                                  |
| slotsProps?.dialogActions? | React.ComponentProps<DialogActionsComponent>                      | {}                     | Props for slots.DialogActions.                                               |
| slots?.Confirm?            | React.ComponentType<ButtonProps>                                  | MUI Button             | Component for confirm button.                                                |
| slotsProps?.confirm?       | React.ComponentProps<ConfirmComponent>                            | {}                     | Props for slots.Confirm.                                                     |
| slots?.Cancel?             | React.ComponentType<ButtonProps>                                  | MUI Button             | Component for cancel button.                                                 |
| slotsProps?.cancel?        | React.ComponentProps<CancelComponent>                             | {}                     | Props for slots.Cancel.                                                      |
| disableClose?              | boolean                                                           | false                  | Disable closing via backdrop click/escape.                                   |
| disableCancel?             | boolean                                                           | false                  | Hide/disable the cancel button.                                              |
| disableConfirm?            | boolean                                                           | false                  | Hide/disable the confirm button.                                             |
| onConfirm?                 | (id: string) => void                                              | () => {}               | Called when confirm button is clicked.                                       |
| onCancel?                  | (id: string) => void                                              | () => {}               | Called when cancel button is clicked.                                        |
| onClosed?                  | (id: string) => void                                              | () => {}               | Called when dialog is closed via backdrop/escape (when not disabled).        |
| shouldClose?               | (reason: 'confirm' \| 'cancel' \| 'close', id: string) => boolean | () => true             | Guard: return false to prevent closing for a given reason.                   |
| buttonOrder?               | Array<'confirm' \| 'cancel'>                                      | ['cancel', 'confirm']  | Controls action buttons order if you need to enforce a specific arrangement. |

You can also open custom body UIs by providing custom slots/components.

### Child hook (advanced)

`useDynamicDialogChild()` → gives `{ id, close, remove }` for the currently rendered dialog, useful when rendering custom content that needs to close itself.

## Local Development

Prereqs: Node 18+, pnpm/yarn/npm.

- Install deps: `yarn` (or `npm i`, `pnpm i`).
- Build: `yarn build`
- Typecheck: `yarn typecheck`
- Lint/format check: `yarn lint:format`
- Format: `yarn format`

This is a library repo (no dev server). You can link it into a test app with `yarn link`/`npm link` or use `pnpm/yarn` workspace.

## Contributing

See CONTRIBUTING.md for detailed guidelines.

Quick version:

- Fork the repo and create a feature branch
- Run build and checks locally before opening a PR
- Open a Pull Request using the provided template

## License

MIT © Luiz Braga

## Acknowledgements

- Built with MUI and Vite
