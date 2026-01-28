import type { DynamicDialogOptions } from "@nardole/mui-dynamic-dialog/provider/DynamicDialogProvider.tsx";
import * as React from "react";
import { DynamicDialogContext } from "@nardole/mui-dynamic-dialog/context/DynamicDialogContext.tsx";
import merge from "lodash.merge";
import { DynamicDialogChildProvider } from "@nardole/mui-dynamic-dialog/provider/DynamicDialogChildProvider.tsx";
import {
  Button as MuiButton,
  Dialog as MuiDialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
} from "@mui/material";

export interface DynamicDialogProps {
  id: string;
  open: boolean;
  options: DynamicDialogOptions;
}

type DefaultOptions = Required<DynamicDialogOptions> & {
  slots: Required<DynamicDialogOptions["slots"]>;
  slotsProps: Required<DynamicDialogOptions["slotsProps"]>;
};

const DEFAULT_OPTIONS: DefaultOptions = {
  title: null,
  content: null,
  confirmText: "Confirm",
  cancelText: "Cancel",
  slots: {
    Dialog: MuiDialog,
    DialogTitle: MuiDialogTitle,
    DialogContent: MuiDialogContent,
    DialogActions: MuiDialogActions,
    Confirm: MuiButton,
    Cancel: MuiButton,
  },
  slotsProps: {
    dialog: {},
    dialogTitle: {},
    dialogContent: {},
    dialogActions: {},
    confirm: {},
    cancel: {},
  },
  disableClose: false,
  disableCancel: false,
  disableConfirm: false,
  onConfirm: function () {},
  onCancel: function () {},
  onClosed: function () {},
  shouldClose: () => true,
  buttonOrder: ["cancel", "confirm"],
};

export function DynamicDialog({ id, open, options }: DynamicDialogProps) {
  const { defaultOptions, close } = React.useContext(DynamicDialogContext);

  const {
    slots: {
      Dialog: DialogSlot,
      DialogTitle: DialogTitleSlot,
      DialogContent: DialogContentSlot,
      DialogActions: DialogActionsSlot,
      Confirm: ConfirmSlot,
      Cancel: CancelSlot,
    },
    ...rest
  } = React.useMemo(
    (): DefaultOptions => merge({}, DEFAULT_OPTIONS, options, defaultOptions),
    [options, defaultOptions],
  );

  const onCancel = React.useCallback(() => {
    close(id, "cancel");

    if (rest.shouldClose("cancel", id)) {
      rest.onCancel(id);
    }
  }, []);

  const onConfirm = React.useCallback(() => {
    rest.onConfirm && rest.onConfirm(id);

    if (rest.shouldClose("confirm", id)) {
      close(id, "confirm");
    }
  }, []);

  const onClose = React.useCallback(() => {
    if (!rest.disableClose && rest.shouldClose("close", id)) {
      close(id, "close");
      rest.onClosed(id);
    }
  }, []);

  const buttons = React.useMemo(
    () => ({
      cancel: !rest.disableCancel && CancelSlot && (
        <CancelSlot {...rest.slotsProps.cancel} onClick={onCancel}>
          {rest.cancelText}
        </CancelSlot>
      ),
      confirm: !rest.disableConfirm && (
        <ConfirmSlot {...rest.slotsProps.confirm} onClick={onConfirm}>
          {rest.confirmText}
        </ConfirmSlot>
      ),
    }),
    [
      rest.disableCancel,
      rest.disableConfirm,
      CancelSlot,
      ConfirmSlot,
      rest.slotsProps.cancel,
      rest.slotsProps.confirm,
      rest.cancelText,
      rest.confirmText,
    ],
  );

  console.log(id);

  return (
    <DynamicDialogChildProvider id={id}>
      <DialogSlot {...rest.slotsProps.dialog} open={open} onClose={onClose}>
        {DialogTitleSlot && rest.title && (
          <DialogTitleSlot {...rest.slotsProps.dialogTitle}>
            {rest.title}
          </DialogTitleSlot>
        )}
        {DialogContentSlot && (
          <DialogContentSlot {...rest.slotsProps.dialogContent}>
            {rest.content}
          </DialogContentSlot>
        )}
        {!rest.disableCancel && !rest.disableConfirm && (
          <DialogActionsSlot {...rest.slotsProps.dialogActions}>
            {rest.buttonOrder.map((button) => buttons[button] ?? null)}
          </DialogActionsSlot>
        )}
      </DialogSlot>
    </DynamicDialogChildProvider>
  );
}
