import { createContext, useContext } from "react";

export const DirectoryContext = createContext({
  handleOpenShareModal: () => {},
  // Other existing context values
});

export function useDirectoryContext() {
  const context = useContext(DirectoryContext);
  if (context === undefined) {
    throw new Error(
      "useDirectoryContext must be used within a DirectoryProvider"
    );
  }
  return context;
}
