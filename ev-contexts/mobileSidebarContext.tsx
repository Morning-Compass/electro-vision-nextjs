"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type MobileSidebarCtx = { open: boolean; setOpen: (v: boolean) => void };

const MobileSidebarContext = createContext<MobileSidebarCtx>({
  open: false,
  setOpen: () => {},
});

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}
