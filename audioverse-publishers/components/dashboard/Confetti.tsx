"use client";

import { useEffect } from "react";

// canvas-confetti ships CJS and doesn't play well with RSC — dynamic-import
// it only on the client, only once, the first render after the welcome page
// mounts.
export function Confetti() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("canvas-confetti");
      if (cancelled) return;
      const confetti = mod.default;
      const end = Date.now() + 1200;
      const colors = ["#FF6B35", "#FFC107", "#10B981", "#FFFFFF"];
      const tick = () => {
        if (Date.now() > end) return;
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        requestAnimationFrame(tick);
      };
      tick();
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
