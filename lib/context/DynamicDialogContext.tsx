import * as React from "react";
import type {
  CloseReason,
  DynamicDialogOptions,
} from "@nardole/mui-dynamic-dialog/provider/DynamicDialogProvider.tsx";

export type DynamicDialogFn = (options: Omit<DynamicDialogOptions, "open">) => {
  id: string;
  close: () => void;
};
export type DynamicDialogCloseFn = (id: string, reason?: CloseReason) => void;
export type DynamicDialogRemoveFn = (id: string) => void;
export interface DynamicDialogContextType {
  defaultOptions?: DynamicDialogOptions;
  dialog: DynamicDialogFn;
  close: DynamicDialogCloseFn;
  remove: DynamicDialogRemoveFn;
}

export const DynamicDialogContext =
  React.createContext<DynamicDialogContextType>({
    dialog: () => {
      throw new Error("Missing Dynamic Dialog Provider");
    },
    close: () => {
      throw new Error("Missing Dynamic Dialog Provider");
    },
    remove: () => {
      throw new Error("Missing Dynamic Dialog Provider");
    },
  });
