"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider localization={jaJP}>
      {children}
    </ClerkProvider>
  );
}
