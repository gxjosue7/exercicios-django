"use client";

import { useSyncExternalStore } from "react";
import { estaLogado, observarLogin } from "./api";

export function useLogado() {
  return useSyncExternalStore(observarLogin, estaLogado, () => false);
}
