import { describe, expect, it } from "vitest";
import type { WorkplaneWorkspaceSettings } from "@/types/meshysmith";
import { DEFAULT_SNAP_GRID, DEFAULT_WORKPLANE_WORKSPACE, normalizeSnapGrid, normalizeWorkspaceSettings, workplaneSettingsFingerprint } from "@/lib/workplaneSettings";

describe("workplane settings helpers", () => {
  it("accepts known snap grid values and falls back for unknown values", () => {
    expect(normalizeSnapGrid("0.5 mm")).toBe("0.5 mm");
    expect(normalizeSnapGrid("Huge")).toBe(DEFAULT_SNAP_GRID);
    expect(normalizeSnapGrid(null, "Off")).toBe("Off");
  });

  it("normalizes workspace settings from partial or invalid data", () => {
    const fallback: WorkplaneWorkspaceSettings = {
      ...DEFAULT_WORKPLANE_WORKSPACE,
      width: 300,
      depth: 250,
      background: "#ffffff",
    };

    expect(normalizeWorkspaceSettings(null, fallback)).toEqual(fallback);
    expect(
      normalizeWorkspaceSettings(
        {
          width: 500,
          depth: Number.NaN,
          sizePreset: "",
          gridBlockSize: 2.5,
          gridBlockPreset: "Custom",
          background: "#123456",
          showShadows: false,
          showGrid: false,
          cruiseShapes: false,
          zoomSpeed: Infinity,
          units: "Bricks",
          scale: "1:10 (centimeters)",
          accuracy: 3,
        },
        fallback,
      ),
    ).toEqual({
      ...fallback,
      width: 500,
      gridBlockSize: 2.5,
      gridBlockPreset: "Custom",
      background: "#123456",
      showShadows: false,
      showGrid: false,
      cruiseShapes: false,
      units: "Bricks",
      scale: "1:10 (centimeters)",
      accuracy: 3,
    });

    expect(normalizeWorkspaceSettings({ accuracy: 9 }, fallback).accuracy).toBe(fallback.accuracy);
  });

  it("fingerprints workspace and snap settings together", () => {
    const base = workplaneSettingsFingerprint(DEFAULT_WORKPLANE_WORKSPACE, "1.0 mm");
    const changedSnap = workplaneSettingsFingerprint(DEFAULT_WORKPLANE_WORKSPACE, "5.0 mm");
    const changedWorkspace = workplaneSettingsFingerprint({ ...DEFAULT_WORKPLANE_WORKSPACE, width: 300 }, "1.0 mm");

    expect(changedSnap).not.toBe(base);
    expect(changedWorkspace).not.toBe(base);
  });
});
