import * as React from "react";
import type {
  ButtonProps,
  DialogActionsProps,
  DialogContentProps,
  DialogProps,
  DialogTitleProps,
} from "@mui/material";
import { useState } from "react";
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
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onClosed?: (id: string) => void;
  shouldClose?: (reason: CloseReason, id: string) => boolean;
  buttonOrder?: ButtonType[];
}
export interface DynamicDialogProviderProps extends React.PropsWithChildren {
  defaultOptions?: DynamicDialogOptions;
}

export function DynamicDialogProvider({
  children,
  defaultOptions,
}: DynamicDialogProviderProps) {
  const [dialogs, setDialogs] = useState<
    {
      id: string;
      options: DynamicDialogOptions;
      open: boolean;
    }[]
  >([]);

  const openDialog = (options: DynamicDialogOptions) => {
    const id = v7();
    setDialogs((dialogs) => [...dialogs, { id, options, open: true }]);
    return {
      id,
      close: () =>
        setDialogs((dialogs) => dialogs.filter((dialog) => dialog.id !== id)),
    };
  };

  const closeDialog = (id: string) => {
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
  };

  const removeDialog = (id: string) => {
    setDialogs((prevState) => prevState.filter((dialog) => dialog.id !== id));
  };

  return (
    <DynamicDialogContext.Provider
      value={{
        dialog: openDialog,
        close: closeDialog,
        remove: removeDialog,
        defaultOptions,
      }}
    >
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
