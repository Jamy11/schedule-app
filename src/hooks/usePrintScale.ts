"use client";

import { useCallback, useEffect, useRef } from "react";

// Letter paper at 0.3in margins each side:
// usable height = (11 - 0.6) × 96 px/in = 998.4 px
// Keep a 50 px reserve for the print-store-info header + rounding
const USABLE_PX = (11 - 0.6) * 96 - 50;

export function usePrintScale() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Lazily create/reuse a <style> element in <head>
  const getStyleEl = useCallback((): HTMLStyleElement => {
    if (!styleRef.current || !styleRef.current.isConnected) {
      const s = document.createElement("style");
      s.setAttribute("data-print-scale", "1");
      document.head.appendChild(s);
      styleRef.current = s;
    }
    return styleRef.current;
  }, []);

  const applyScale = useCallback(() => {
    const el = document.querySelector(
      ".schedule-content"
    ) as HTMLElement | null;
    if (!el) return;

    const contentH = el.scrollHeight;
    console.log("[print-scale] scrollHeight:", contentH, "/ usable:", USABLE_PX);

    if (contentH > USABLE_PX) {
      const scale = USABLE_PX / contentH;
      console.log("[print-scale] applying zoom:", scale.toFixed(4));
      // Inject into @media print so the screen layout is untouched
      getStyleEl().textContent = `@media print { body { zoom: ${scale.toFixed(4)}; } }`;
    } else {
      // No zoom needed – clear any previous rule
      if (styleRef.current) styleRef.current.textContent = "";
    }
  }, [getStyleEl]);

  const resetScale = useCallback(() => {
    if (styleRef.current) styleRef.current.textContent = "";
  }, []);

  // Handles Cmd+P / Ctrl+P
  useEffect(() => {
    window.addEventListener("beforeprint", applyScale);
    window.addEventListener("afterprint", resetScale);
    return () => {
      window.removeEventListener("beforeprint", applyScale);
      window.removeEventListener("afterprint", resetScale);
    };
  }, [applyScale, resetScale]);

  // Returned function is called by the Print button
  return useCallback(() => {
    applyScale();
    window.print();
  }, [applyScale]);
}
