import * as React from "react";
import { DynamicDialogChildContext } from "@nardole/mui-dynamic-dialog/context/DynamicDialogChildContext.ts";
import { useDynamicDialog } from "@nardole/mui-dynamic-dialog/hook/useDynamicDialog.ts";
export interface DynamicDialogChildProviderProps
  extends React.PropsWithChildren {
  id: string;
}

export function DynamicDialogChildProvider({
  children,
  id,
}: DynamicDialogChildProviderProps) {
  const { close, remove } = useDynamicDialog();

  const handleClose = () => close(id);

  const handleRemove = () => remove(id);

  return (
    <DynamicDialogChildContext.Provider
      value={{
        id,
        close: handleClose,
        remove: handleRemove,
      }}
    >
      {children}
    </DynamicDialogChildContext.Provider>
  );
}
