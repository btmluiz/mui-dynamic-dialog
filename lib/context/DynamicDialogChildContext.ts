import { default as React } from "react";
export interface DynamicDialogChildContextType {
  id: string;
  close: () => void;
  remove: () => void;
}

export const DynamicDialogChildContext =
  React.createContext<DynamicDialogChildContextType>({
    id: "",
    close: () => {},
    remove: () => {},
  });
