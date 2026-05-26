import type { DynamicDialogOptions } from "@nardole/mui-dynamic-dialog/provider/DynamicDialogProvider.tsx";
import * as React from "react";
import { DynamicDialogContext } from "@nardole/mui-dynamic-dialog/context/DynamicDialogContext.tsx";
import { deepMerge } from "@nardole/mui-dynamic-dialog/utils/deepMerge.ts";
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

export function DynamicDialog({
  id,
  open,
  options,
}: Readonly<DynamicDialogProps>) {
  const { defaultOptions, close } = React.useContext(DynamicDialogContext);
  const [canceling, setCanceling] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

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
    () =>
      deepMerge<DefaultOptions>({}, DEFAULT_OPTIONS, options, defaultOptions),
    [options, defaultOptions],
  );

  const onCancel = React.useCallback(async () => {
    if (rest.shouldClose("cancel", id)) {
      setCanceling(true);
      const result = rest.onCancel(id);

      if (result instanceof Promise) {
        await result;
      }

      setCanceling(false);
      close(id, "cancel");
    }
  }, [close, id, rest]);

  const onConfirm = React.useCallback(async () => {
    setLoading(true);
    const result = rest.onConfirm(id);

    if (result instanceof Promise) {
      await result;
    }

    setLoading(false);
    if (rest.shouldClose("confirm", id)) {
      close(id, "confirm");
    }
  }, [close, id, rest]);

  const onClose = React.useCallback(async () => {
    if (!rest.disableClose && rest.shouldClose("close", id)) {
      setCanceling(true);
      const result = rest.onClosed(id);

      if (result instanceof Promise) {
        await result;
      }

      setCanceling(false);
      close(id, "close");
    }
  }, [close, id, rest]);

  const buttons = React.useMemo(
    () => ({
      cancel: !rest.disableCancel && CancelSlot && (
        <CancelSlot
          key="cancel"
          {...rest.slotsProps.cancel}
          onClick={onCancel}
          disabled={loading}
        >
          {rest.cancelText}
        </CancelSlot>
      ),
      confirm: !rest.disableConfirm && (
        <ConfirmSlot
          key="confirm"
          {...rest.slotsProps.confirm}
          onClick={onConfirm}
          disabled={canceling}
          loading={loading}
        >
          {rest.confirmText}
        </ConfirmSlot>
      ),
    }),
    [
      rest.disableCancel,
      rest.slotsProps.cancel,
      rest.slotsProps.confirm,
      rest.cancelText,
      rest.disableConfirm,
      rest.confirmText,
      CancelSlot,
      onCancel,
      ConfirmSlot,
      onConfirm,
      loading,
      canceling,
    ],
  );

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
        {(!rest.disableCancel || !rest.disableConfirm) && (
          <DialogActionsSlot {...rest.slotsProps.dialogActions}>
            {rest.buttonOrder.map((button) => buttons[button] ?? null)}
          </DialogActionsSlot>
        )}
      </DialogSlot>
    </DynamicDialogChildProvider>
  );
}
