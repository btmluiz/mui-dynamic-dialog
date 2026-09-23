import * as React from "react";
import type {
  ButtonProps,
  DialogActionsProps,
  DialogContentProps,
  DialogProps,
  DialogTitleProps,
} from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { DynamicDialogContext } from "@nardole/mui-dynamic-dialog/context/DynamicDialogContext";
import { DynamicDialog } from "@nardole/mui-dynamic-dialog/dialog/DynamicDialog.tsx";
import { v7 } from "uuid";

export type ButtonType = "confirm" | "cancel";

export type CloseReason = "confirm" | "cancel" | "close";

export interface DynamicDialogOptions<
  DialogComponent extends React.ComponentType<DialogProps> =
    React.ComponentType<DialogProps>,
  DialogTitleComponent extends React.ComponentType =
    React.ComponentType<DialogTitleProps>,
  DialogContentComponent extends React.ComponentType =
    React.ComponentType<DialogContentProps>,
  DialogActionsComponent extends React.ComponentType =
    React.ComponentType<DialogActionsProps>,
  ConfirmComponent extends React.ComponentType =
    React.ComponentType<ButtonProps>,
  CancelComponent extends React.ComponentType =
    React.ComponentType<ButtonProps>,
> {
  title?: React.ReactNode;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  slots?: {
    Dialog?: DialogComponent;
    DialogTitle?: DialogTitleComponent;
    DialogContent?: DialogContentComponent;
    DialogActions?: DialogActionsComponent;
    Confirm?: ConfirmComponent;
    Cancel?: CancelComponent;
  };
  slotsProps?: {
    dialog?: Omit<React.ComponentProps<DialogComponent>, "open">;
    dialogTitle?: React.ComponentProps<DialogTitleComponent>;
    dialogContent?: React.ComponentProps<DialogContentComponent>;
    dialogActions?: React.ComponentProps<DialogActionsComponent>;
    confirm?: React.ComponentProps<ConfirmComponent>;
    cancel?: React.ComponentProps<ConfirmComponent>;
  };
  disableClose?: boolean;
  disableCancel?: boolean;
  disableConfirm?: boolean;
  onConfirm?: (id: string) => void | Promise<void>;
  onCancel?: (id: string) => void | Promise<void>;
  onClosed?: (id: string) => void | Promise<void>;
  shouldClose?: (reason: CloseReason, id: string) => boolean;
  buttonOrder?: ButtonType[];
}
export interface DynamicDialogProviderProps extends React.PropsWithChildren {
  defaultOptions?: DynamicDialogOptions;
}

export type DialogResolver = (
  value: CloseReason | PromiseLike<CloseReason>,
) => void;

export function DynamicDialogProvider({
  children,
  defaultOptions,
}: Readonly<DynamicDialogProviderProps>) {
  const [dialogs, setDialogs] = useState<
    {
      id: string;
      options: DynamicDialogOptions;
      open: boolean;
    }[]
  >([]);

  const resolvers = useRef(new Map<string, DialogResolver>());

  const resolveDialog = useCallback((id: string, reason: CloseReason) => {
    const resolve = resolvers.current.get(id);
    if (resolve) {
      resolvers.current.delete(id);
      resolve(reason);
    }
  }, []);

  const removeDialog = useCallback(
    (id: string) => {
      resolveDialog(id, "close");
      setDialogs((prevState) => prevState.filter((dialog) => dialog.id !== id));
    },
    [resolveDialog],
  );

  const closeDialog = useCallback(
    (id: string, reason: CloseReason = "close") => {
      setDialogs((prevState) => {
        const index = prevState.findIndex((dialog) => dialog.id === id);
        const dialog = prevState[index];
        if (dialog) {
          const newState = [...prevState];
          newState[index] = { ...dialog, open: false };
          return newState;
        }

        return prevState;
      });

      resolveDialog(id, reason);
      removeDialog(id);
    },
    [removeDialog, resolveDialog],
  );

  const openDialog = useCallback(
    (options: DynamicDialogOptions) => {
      const id = v7();
      const dialogPromise = new Promise<CloseReason>((resolve) => {
        resolvers.current.set(id, resolve);
      });

      setDialogs((dialogs) => [...dialogs, { id, options, open: true }]);

      return {
        id,
        close: () => closeDialog(id),
        unwrap: () => dialogPromise,
      };
    },
    [closeDialog, setDialogs],
  );

  const providerProps = useMemo(
    () => ({
      dialog: openDialog,
      close: closeDialog,
      remove: removeDialog,
      defaultOptions,
    }),
    [openDialog, closeDialog, removeDialog, defaultOptions],
  );

  return (
    <DynamicDialogContext.Provider value={providerProps}>
      {children}
      {dialogs.map((dialog) => (
        <DynamicDialog
          key={dialog.id}
          id={dialog.id}
          open={dialog.open}
          options={dialog.options}
        />
      ))}
    </DynamicDialogContext.Provider>
  );
}
