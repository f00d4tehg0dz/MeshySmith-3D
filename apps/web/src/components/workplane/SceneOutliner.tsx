"use client";

import { Eye, EyeOff, Lock, Unlock, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { useState } from "react";
import type { WorkplaneShape } from "@/types/meshysmith";

interface SceneOutlinerProps {
  shapes: WorkplaneShape[];
  selectedIds: string[];
  onSelect: (id: string, additive: boolean) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onContextMenu?: (id: string, x: number, y: number) => void;
}

function describeKind(shape: WorkplaneShape): string {
  if (shape.groupedShapes?.length) return `Group · ${shape.groupedShapes.length}`;
  return shape.kind;
}

export function SceneOutliner({ shapes, selectedIds, onSelect, onToggleHidden, onToggleLocked, onRename, onContextMenu }: SceneOutlinerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  return (
    <aside
      className={`scene-outliner ${collapsed ? "collapsed" : ""}`}
      data-scene-outliner
      data-collapsed={collapsed ? "true" : "false"}
      aria-label="Scene outliner"
    >
      <header className="scene-outliner-header">
        <div className="scene-outliner-title">
          <Layers size={15} />
          <span>Scene</span>
          <span className="scene-outliner-count" data-outliner-count>{shapes.length}</span>
        </div>
        <button
          type="button"
          className="scene-outliner-collapse"
          aria-label={collapsed ? "Expand scene outliner" : "Collapse scene outliner"}
          aria-pressed={collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </header>
      {!collapsed && (
        <div className="scene-outliner-body">
          {shapes.length === 0 ? (
            <div className="scene-outliner-empty" data-outliner-empty>
              No shapes yet — drag one from the Shapes menu to start.
            </div>
          ) : (
            <ul className="scene-outliner-list" role="listbox" aria-label="Shapes in scene">
              {shapes.map((shape) => {
                const selected = selectedIds.includes(shape.id);
                const isEditing = editingId === shape.id;
                return (
                  <li
                    key={shape.id}
                    className={`scene-outliner-row ${selected ? "selected" : ""}`}
                    data-outliner-row
                    data-shape-id={shape.id}
                    aria-selected={selected}
                    role="option"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "copy";
                      event.dataTransfer.setData("application/x-meshysmith-clone", JSON.stringify({ id: shape.id }));
                    }}
                    onContextMenu={(event) => {
                      if (!onContextMenu) return;
                      event.preventDefault();
                      onContextMenu(shape.id, event.clientX, event.clientY);
                    }}
                  >
                    <button
                      type="button"
                      className="scene-outliner-visibility"
                      aria-label={shape.hidden ? `Show ${shape.name}` : `Hide ${shape.name}`}
                      title={shape.hidden ? "Show" : "Hide"}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleHidden(shape.id);
                      }}
                    >
                      {shape.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <span
                      className="scene-outliner-swatch"
                      style={{ background: shape.hole ? "transparent" : shape.color, borderColor: shape.color }}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      className="scene-outliner-label"
                      onClick={(event) => onSelect(shape.id, event.shiftKey || event.metaKey || event.ctrlKey)}
                      onDoubleClick={() => {
                        setEditingId(shape.id);
                        setDraftName(shape.name);
                      }}
                      title={`${shape.name} (double-click to rename)`}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="scene-outliner-rename"
                          value={draftName}
                          onChange={(event) => setDraftName(event.currentTarget.value)}
                          onBlur={() => {
                            if (draftName.trim()) onRename(shape.id, draftName.trim());
                            setEditingId(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              if (draftName.trim()) onRename(shape.id, draftName.trim());
                              setEditingId(null);
                            } else if (event.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          onClick={(event) => event.stopPropagation()}
                        />
                      ) : (
                        <>
                          <span className="scene-outliner-name">{shape.name}</span>
                          <span className="scene-outliner-kind">{describeKind(shape)}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="scene-outliner-lock"
                      aria-label={shape.locked ? `Unlock ${shape.name}` : `Lock ${shape.name}`}
                      title={shape.locked ? "Unlock" : "Lock"}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleLocked(shape.id);
                      }}
                    >
                      {shape.locked ? <Lock size={13} /> : <Unlock size={13} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
