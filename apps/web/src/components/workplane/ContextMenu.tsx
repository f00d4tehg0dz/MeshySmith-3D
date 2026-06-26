"use client";

import { useEffect, useRef, type ReactNode } from "react";

export type ContextMenuItem =
  | { kind: "separator" }
  | {
      kind: "action";
      id: string;
      label: string;
      icon?: ReactNode;
      shortcut?: string;
      disabled?: boolean;
      onSelect: () => void;
    };

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer, true);
    };
  }, [onClose]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Clamp into viewport.
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    if (rect.left > maxX) el.style.left = `${Math.max(8, maxX)}px`;
    if (rect.top > maxY) el.style.top = `${Math.max(8, maxY)}px`;
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="context-menu"
      role="menu"
      data-context-menu
      style={{ left: x, top: y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.kind === "separator") {
          return <div key={`sep-${index}`} className="context-menu-separator" role="separator" />;
        }
        return (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            className="context-menu-item"
            disabled={item.disabled}
            data-context-action={item.id}
            onClick={() => {
              if (item.disabled) return;
              item.onSelect();
              onClose();
            }}
          >
            <span className="context-menu-icon" aria-hidden="true">{item.icon ?? null}</span>
            <span className="context-menu-label">{item.label}</span>
            {item.shortcut ? <span className="context-menu-shortcut">{item.shortcut}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
