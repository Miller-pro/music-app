"use client";

import { Toaster } from "react-hot-toast";

export function ToastHost() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#22223D",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: "0.875rem",
        },
      }}
    />
  );
}
