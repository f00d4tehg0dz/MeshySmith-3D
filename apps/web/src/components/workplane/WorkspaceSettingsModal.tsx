"use client";

import { Grid3X3, Palette, Ruler, X } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { GridSize, WorkplaneWorkspaceSettings } from "@/types/meshysmith";

type WorkspaceSettings = WorkplaneWorkspaceSettings;
type WorkspaceSettingsSection = "appearance" | "measurement" | "workplane";

const GRID_SIZES: GridSize[] = ["Off", "0.1 mm", "0.25 mm", "0.5 mm", "1.0 mm", "2.0 mm", "5.0 mm", "Brick"];
const MIN_WORKSPACE_SIZE = 60;
const MAX_WORKSPACE_SIZE = 2000;
const MIN_GRID_BLOCK_SIZE = 1;
const MAX_GRID_BLOCK_SIZE = 200;
const WORKSPACE_SIZE_PRESETS = [
  { label: "200 x 200 mm", width: 200, depth: 200 },
  { label: "300 x 300 mm", width: 300, depth: 300 },
  { label: "500 x 500 mm", width: 500, depth: 500 },
  { label: "1000 x 1000 mm", width: 1000, depth: 1000 },
  { label: "2000 x 2000 mm", width: 2000, depth: 2000 },
  { label: "Custom", width: 200, depth: 200 },
];
const GRID_BLOCK_PRESETS = ["1 mm", "2.5 mm", "5 mm", "10 mm", "20 mm", "50 mm", "100 mm", "Custom"] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function gridBlockSizeForPreset(preset: string, fallback: number) {
  if (preset === "Custom") {
    return clamp(fallback, MIN_GRID_BLOCK_SIZE, MAX_GRID_BLOCK_SIZE);
  }
  return clamp(Number.parseFloat(preset) || DEFAULT_WORKPLANE_WORKSPACE.gridBlockSize, MIN_GRID_BLOCK_SIZE, MAX_GRID_BLOCK_SIZE);
}

export function WorkspaceSettingsModal({
  workspace,
  snap,
  onWorkspaceChange,
  onSnapChange,
  onMakeDefault,
  onClose,
}: {
  workspace: WorkspaceSettings;
  snap: GridSize;
  onWorkspaceChange: (next: WorkspaceSettings) => void;
  onSnapChange: (next: GridSize) => void;
  onMakeDefault: () => void;
  onClose: () => void;
}) {
  const [defaultSaved, setDefaultSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<WorkspaceSettingsSection>("appearance");
  const patchWorkspace = (patch: Partial<WorkspaceSettings>) => {
    setDefaultSaved(false);
    onWorkspaceChange({ ...workspace, ...patch });
  };
  const setDimension = (key: "width" | "depth", value: string) => {
    const next = clamp(Number.parseFloat(value) || DEFAULT_WORKPLANE_WORKSPACE[key], MIN_WORKSPACE_SIZE, MAX_WORKSPACE_SIZE);
    patchWorkspace({ [key]: next, sizePreset: "Custom" } as Partial<WorkspaceSettings>);
  };
  const setWorkspaceSizePreset = (sizePreset: string) => {
    const preset = WORKSPACE_SIZE_PRESETS.find((entry) => entry.label === sizePreset);
    if (!preset || sizePreset === "Custom") {
      patchWorkspace({ sizePreset: "Custom" });
      return;
    }
    patchWorkspace({ sizePreset, width: preset.width, depth: preset.depth });
  };
  const setGridBlockPreset = (gridBlockPreset: string) => {
    patchWorkspace({ gridBlockPreset, gridBlockSize: gridBlockSizeForPreset(gridBlockPreset, workspace.gridBlockSize) });
  };
  const setGridBlockSize = (value: string) => {
    const next = clamp(Number.parseFloat(value) || DEFAULT_WORKPLANE_WORKSPACE.gridBlockSize, MIN_GRID_BLOCK_SIZE, MAX_GRID_BLOCK_SIZE);
    patchWorkspace({ gridBlockPreset: "Custom", gridBlockSize: next });
  };

  return (
    <div className="workspace-modal" role="dialog" aria-modal="true" aria-label="Workspace settings">
      <div className="workspace-modal-card" onPointerDown={(event) => event.stopPropagation()}>
        <header className="workspace-modal-header">
          <strong>Workspace settings</strong>
          <button aria-label="Close settings" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="workspace-modal-layout">
          <nav className="workspace-settings-nav" aria-label="Workspace settings sections">
            <button className={activeSection === "appearance" ? "active" : ""} aria-current={activeSection === "appearance" ? "page" : undefined} onClick={() => setActiveSection("appearance")}>
              <Palette size={18} />
              <span>Appearance</span>
            </button>
            <button className={activeSection === "measurement" ? "active" : ""} aria-current={activeSection === "measurement" ? "page" : undefined} onClick={() => setActiveSection("measurement")}>
              <Ruler size={18} />
              <span>Measurement</span>
            </button>
            <button className={activeSection === "workplane" ? "active" : ""} aria-current={activeSection === "workplane" ? "page" : undefined} onClick={() => setActiveSection("workplane")}>
              <Grid3X3 size={18} />
              <span>Workplane</span>
            </button>
          </nav>

          <div className="workspace-modal-content">
            <div className="workspace-modal-body">
              {activeSection === "appearance" ? (
                <>
                  <div className="workspace-section-heading">
                    <strong>Appearance</strong>
                    <span>Adjust the canvas and navigation behavior.</span>
                  </div>
                  <div className="workspace-row">
                    <span>Background color</span>
                    <button
                      className="workspace-color-button"
                      style={{ "--workspace-bg": workspace.background } as CSSProperties}
                      aria-label="Background color"
                      onClick={() => patchWorkspace({ background: workspace.background === "#f8fbfc" ? "#eaf7fb" : "#f8fbfc" })}
                    />
                  </div>
                  <WorkspaceToggle label="Show shadows" checked={workspace.showShadows} onChange={(showShadows) => patchWorkspace({ showShadows })} />
                  <WorkspaceToggle label="Show grid" checked={workspace.showGrid} onChange={(showGrid) => patchWorkspace({ showGrid })} />
                  <WorkspaceToggle
                    label="Cruise when adding new shapes"
                    checked={workspace.cruiseShapes}
                    onChange={(cruiseShapes) => patchWorkspace({ cruiseShapes })}
                  />
                  <label className="workspace-range">
                    <span>Zoom speed</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={workspace.zoomSpeed}
                      onChange={(event) => patchWorkspace({ zoomSpeed: Number(event.currentTarget.value) })}
                    />
                    <small>
                      <span>Slow</span>
                      <span>Fast</span>
                    </small>
                  </label>
                </>
              ) : null}

              {activeSection === "measurement" ? (
                <>
                  <div className="workspace-section-heading">
                    <strong>Measurement</strong>
                    <span>Choose units, precision, scale, and snapping.</span>
                  </div>
                  <WorkspaceSelect
                    label="Units"
                    value={workspace.units}
                    options={["Metric (Default)", "Imperial", "Bricks"]}
                    onChange={(units) => patchWorkspace({ units })}
                  />
                  <WorkspaceSelect
                    label="Scale"
                    value={workspace.scale}
                    options={["1:1 (millimeters)", "1:10 (centimeters)", "1:100 (meters)", "1:1000 (meters)"]}
                    onChange={(scale) => patchWorkspace({ scale })}
                  />
                  <WorkspaceSelect
                    label="Accuracy"
                    value={`0.${"0".repeat(workspace.accuracy)}`}
                    options={["0.0", "0.00", "0.000"]}
                    onChange={(accuracy) => patchWorkspace({ accuracy: accuracy.slice(2).length as WorkspaceSettings["accuracy"] })}
                  />
                  <WorkspaceSelect
                    label="Snap Grid"
                    value={snap}
                    options={GRID_SIZES}
                    onChange={(next) => {
                      setDefaultSaved(false);
                      onSnapChange(next as GridSize);
                    }}
                  />
                </>
              ) : null}

              {activeSection === "workplane" ? (
                <>
                  <div className="workspace-section-heading">
                    <strong>Workplane</strong>
                    <span>Set the plate dimensions and visible grid spacing.</span>
                  </div>
                  <WorkspaceSelect
                    label="Workplane size"
                    value={workspace.sizePreset}
                    options={WORKSPACE_SIZE_PRESETS.map((preset) => preset.label)}
                    onChange={setWorkspaceSizePreset}
                  />
                  <div className="workspace-dimensions">
                    <label>
                      <span>Width</span>
                      <input
                        type="number"
                        value={workspace.width.toFixed(workspace.accuracy)}
                        min={MIN_WORKSPACE_SIZE}
                        max={MAX_WORKSPACE_SIZE}
                        step={1}
                        onChange={(event) => setDimension("width", event.currentTarget.value)}
                      />
                    </label>
                    <label>
                      <span>Length</span>
                      <input
                        type="number"
                        value={workspace.depth.toFixed(workspace.accuracy)}
                        min={MIN_WORKSPACE_SIZE}
                        max={MAX_WORKSPACE_SIZE}
                        step={1}
                        onChange={(event) => setDimension("depth", event.currentTarget.value)}
                      />
                    </label>
                  </div>
                  <WorkspaceSelect label="Grid block size" value={workspace.gridBlockPreset} options={GRID_BLOCK_PRESETS} onChange={setGridBlockPreset} />
                  {workspace.gridBlockPreset === "Custom" ? (
                    <div className="workspace-dimensions workspace-grid-dimensions">
                      <label>
                        <span>Block size</span>
                        <input
                          type="number"
                          value={workspace.gridBlockSize.toFixed(workspace.accuracy)}
                          min={MIN_GRID_BLOCK_SIZE}
                          max={MAX_GRID_BLOCK_SIZE}
                          step={0.5}
                          onChange={(event) => setGridBlockSize(event.currentTarget.value)}
                        />
                      </label>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="workspace-modal-footer">
              <span>Save the current settings for this project.</span>
              <button
                className="make-default-button"
                onClick={() => {
                  onMakeDefault();
                  setDefaultSaved(true);
                }}
              >
                {defaultSaved ? "Default saved" : "Make default"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <button className="workspace-modal-backdrop" aria-label="Close settings" onClick={onClose} />
    </div>
  );
}

function WorkspaceToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="workspace-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
    </label>
  );
}

function WorkspaceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="workspace-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.currentTarget.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
