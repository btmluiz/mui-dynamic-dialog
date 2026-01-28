import { useContext } from "react";
import { DynamicDialogChildContext } from "@nardole/mui-dynamic-dialog/context/DynamicDialogChildContext";

export function useDynamicDialogChild() {
  return useContext(DynamicDialogChildContext);
}
