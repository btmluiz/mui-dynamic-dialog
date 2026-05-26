import * as React from "react";
import type {
  ButtonProps,
  DialogActionsProps,
  DialogContentProps,
  DialogProps,
  DialogTitleProps,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
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

export type DialogResolver = (value: void | PromiseLike<void>) => void;

export function DynamicDialogProvider({
  children,
  defaultOptions,
}: Readonly<DynamicDialogProviderProps>) {
  const [dialogs, setDialogs] = useState<
    {
      id: string;
      options: DynamicDialogOptions;
      open: boolean;
      resolve?: DialogResolver;
    }[]
  >([]);

  const removeDialog = useCallback(
    (id: string) => {
      setDialogs((prevState) => prevState.filter((dialog) => dialog.id !== id));
    },
    [setDialogs],
  );

  const closeDialog = useCallback(
    (id: string) => {
      setDialogs((prevState) => {
        const index = prevState.findIndex((dialog) => dialog.id === id);
        if (index >= 0) {
          const newState = [...prevState];
          if (newState[index]) {
            newState[index].open = false;
          }
          return newState;
        }

        return prevState;
      });

      removeDialog(id);
    },
    [removeDialog],
  );

  const openDialog = useCallback(
    (options: DynamicDialogOptions) => {
      const id = v7();
      let dialogResolve: DialogResolver = () => {};
      const dialogPromise = new Promise<void>((resolve) => {
        dialogResolve = resolve;
      });

      setDialogs((dialogs) => [
        ...dialogs,
        { id, options, open: true, resolve: dialogResolve },
      ]);

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
