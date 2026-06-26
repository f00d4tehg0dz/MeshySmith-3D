"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "meshysmith.tourDismissed";

interface Step {
  id: string;
  title: string;
  body: string;
  targetSelector?: string; // optional — undefined = full-screen overlay (used for welcome + finale)
  placement?: "left" | "right" | "bottom";
}

const STEPS: Step[] = [
  {
    id: "welcome",
    title: "Welcome to MeshySmith",
    body: "A 30-second tour of the editor. Press Escape any time to skip.",
  },
  {
    id: "shapes",
    title: "Add shapes",
    body: "Open the Shapes menu, pick a category, search by name, then click or drag a shape onto the workplane.",
    targetSelector: ".shape-menu-trigger",
    placement: "bottom",
  },
  {
    id: "outliner",
    title: "Scene outliner",
    body: "Every shape lands here. Click a row to select, toggle the eye to hide, or drag a row back onto the workplane to clone.",
    targetSelector: "[data-scene-outliner]",
    placement: "right",
  },
  {
    id: "viewcube",
    title: "ViewCube",
    body: "Click a face, edge, or corner to snap to a view. Drag the cube itself to orbit. The buttons below switch perspective / orthographic, fit to view, and home.",
    targetSelector: "[data-view-cube]",
    placement: "right",
  },
  {
    id: "theme",
    title: "Themes",
    body: "Cycle light / dark / system from the top right. Your choice is remembered.",
    targetSelector: "[data-theme-toggle]",
    placement: "left",
  },
  {
    id: "done",
    title: "You're ready",
    body: "Press F to fit the view, Shift-click to multi-select, and Ctrl+D to duplicate. Have fun.",
  },
];

interface TourSpotlight {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPos {
  top: number;
  left: number;
  placement: "left" | "right" | "bottom";
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function OnboardingTour({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<TourSpotlight | null>(null);
  const [tooltip, setTooltip] = useState<TooltipPos | null>(null);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setIndex(0);
      return;
    }
    if (!readDismissed()) {
      const t = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(t);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (!open) {
      setSpotlight(null);
      setTooltip(null);
      return;
    }
    const step = STEPS[index];
    if (!step.targetSelector) {
      setSpotlight(null);
      const w = window.innerWidth;
      const h = window.innerHeight;
      setTooltip({ top: h / 2 - 80, left: w / 2 - 180, placement: "bottom" });
      return;
    }
    const updatePositions = () => {
      const el = document.querySelector(step.targetSelector!);
      if (!el) {
        setSpotlight(null);
        setTooltip({ top: 80, left: 80, placement: step.placement ?? "bottom" });
        return;
      }
      const rect = el.getBoundingClientRect();
      const padding = 8;
      const spot: TourSpotlight = {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      };
      setSpotlight(spot);
      const placement = step.placement ?? "bottom";
      const TOOLTIP_W = 320;
      let top = rect.bottom + 14;
      let left = rect.left;
      if (placement === "right") {
        top = rect.top;
        left = rect.right + 14;
      } else if (placement === "left") {
        top = rect.top;
        left = rect.left - TOOLTIP_W - 14;
      }
      // Clamp inside viewport.
      left = Math.max(12, Math.min(window.innerWidth - TOOLTIP_W - 12, left));
      top = Math.max(12, Math.min(window.innerHeight - 200, top));
      setTooltip({ top, left, placement });
    };
    updatePositions();
    window.addEventListener("resize", updatePositions);
    return () => window.removeEventListener("resize", updatePositions);
  }, [index, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const step = STEPS[index];
  const finish = () => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    onClose?.();
  };
  const next = () => {
    if (index < STEPS.length - 1) setIndex(index + 1);
    else finish();
  };
  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <div className="onboarding-tour" data-onboarding-tour role="dialog" aria-modal="true" aria-label={step.title}>
      <div className="onboarding-overlay" onClick={finish} />
      {spotlight ? (
        <div
          className="onboarding-spotlight"
          style={{ top: spotlight.top, left: spotlight.left, width: spotlight.width, height: spotlight.height }}
          aria-hidden="true"
        />
      ) : null}
      {tooltip ? (
        <div className="onboarding-tooltip" style={{ top: tooltip.top, left: tooltip.left }} data-onboarding-tooltip>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
          <div className="onboarding-progress">
            <span>{index + 1} / {STEPS.length}</span>
            <div className="onboarding-buttons">
              <button type="button" className="onboarding-skip" onClick={finish}>Skip</button>
              {index > 0 ? (
                <button type="button" className="onboarding-secondary" onClick={prev}>Back</button>
              ) : null}
              <button type="button" className="onboarding-primary" onClick={next} data-onboarding-next>
                {index === STEPS.length - 1 ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function resetOnboarding() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}
