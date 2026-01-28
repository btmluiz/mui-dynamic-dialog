import { useContext } from "react";
import { DynamicDialogContext } from "@nardole/mui-dynamic-dialog/context/DynamicDialogContext.tsx";

export function useDynamicDialog() {
  return useContext(DynamicDialogContext);
}
