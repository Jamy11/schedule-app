"use client";

import { useCallback, useEffect, useRef } from "react";

// Letter paper at 0.3in margins each side:
// usable height = (11 - 0.6) × 96 px/in ≈ 998 px.
// Reserve ~80 px for the print-store-info header + print/screen width diff.
const USABLE_PX = (11 - 0.6) * 96 - 80; // ≈ 918 px

/**
 * Scales the schedule onto a single printed letter page.
 *
 * Technique: the schedule lives inside a `.print-fit-wrap` clip box. When the
 * content is taller than one page, we inject a PRINT-ONLY rule that gives the
 * wrapper a fixed (scaled) height with `overflow: hidden`, and scales the inner
 * `.schedule-content` with `transform: scale()`. The transformed content fits
 * the clip box exactly — nothing is cut off, and the wrapper's real layout
 * height drives pagination to one page.
 *
 * Why not `zoom`: recent Chrome (≈v146+) stopped reliably applying `zoom` to
 * print pagination, so a `zoom`-scaled page still broke to a second sheet.
 * `transform` + a fixed-height clip box is deterministic across versions.
 *
 * The rule is recomputed whenever the content resizes (via ResizeObserver) and
 * kept in the DOM at all times — so it's already applied when the user prints,
 * avoiding the `beforeprint` timing race (another newer-Chrome pitfall).
 */
export function usePrintScale() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const getStyleEl = useCallback((): HTMLStyleElement => {
    if (!styleRef.current || !styleRef.current.isConnected) {
      const s = document.createElement("style");
      s.setAttribute("data-print-scale", "1");
      document.head.appendChild(s);
      styleRef.current = s;
    }
    return styleRef.current;
  }, []);

  const recompute = useCallback(() => {
    const el = document.querySelector(".schedule-content") as HTMLElement | null;
    const style = getStyleEl();
    if (!el) {
      style.textContent = "";
      return;
    }
    const natural = el.scrollHeight;
    if (natural <= USABLE_PX) {
      style.textContent = ""; // fits already — no scaling
      return;
    }
    const scale = USABLE_PX / natural;
    const clipHeight = Math.ceil(natural * scale);
    style.textContent = `@media print {
      .print-fit-wrap { height: ${clipHeight}px; overflow: hidden; }
      .print-fit-wrap > .schedule-content {
        transform: scale(${scale.toFixed(4)});
        transform-origin: top left;
        width: ${(100 / scale).toFixed(2)}%;
      }
    }`;
  }, [getStyleEl]);

  useEffect(() => {
    recompute();
    const el = document.querySelector(".schedule-content");
    const ro = el ? new ResizeObserver(() => recompute()) : null;
    if (el && ro) ro.observe(el);
    // Refresh once more right before printing (covers Cmd/Ctrl+P)
    window.addEventListener("beforeprint", recompute);
    return () => {
      ro?.disconnect();
      window.removeEventListener("beforeprint", recompute);
    };
  }, [recompute]);

  // Print button: make sure the rule is current, then print.
  return useCallback(() => {
    recompute();
    window.print();
  }, [recompute]);
}
