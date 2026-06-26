"use client";

import { ChevronDown, ChevronUp, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useEffect, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { ToolbarHideSelectedIcon } from "@/components/icons";
import { fallbackSolidColor, resizedShapeSize, shapeDepth, shapeWidth } from "@/lib/workplaneShapes";
import type { GridSize, MeasurementAccuracy, WorkplaneShape } from "@/types/meshysmith";

const GRID_SIZES: GridSize[] = ["Off", "0.1 mm", "0.25 mm", "0.5 mm", "1.0 mm", "2.0 mm", "5.0 mm", "Brick"];
const MIN_SHAPE_SIZE = 0.01;
const SOLID_COLORS = [
  "#d41721",
  "#ff4b4b",
  "#ff7a1a",
  "#d97813",
  "#f6a21a",
  "#f2cf10",
  "#f7e65a",
  "#a8d642",
  "#33983d",
  "#1fb66d",
  "#18b99a",
  "#0098c7",
  "#49c7ef",
  "#3b82f6",
  "#294c93",
  "#5b5ce2",
  "#6e2786",
  "#9b3bd2",
  "#c9009a",
  "#f062b6",
  "#8a5a2b",
  "#b98254",
  "#f2caa0",
  "#ffffff",
  "#cfd8df",
  "#8a98a6",
  "#4b5563",
  "#111111",
];
const TEXT_FONT_OPTIONS = ["Multilanguage", "Sans", "Serif", "Script", "Monospace", "Rounded", "Stencil"];

type RangePropertyConfig = {
  type?: "range";
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

type TextPropertyConfig = {
  type: "text";
  label: string;
  value: string;
  onChange: (value: string) => void;
};

type SelectPropertyConfig = {
  type: "select";
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

type ShapePropertyConfig = RangePropertyConfig | TextPropertyConfig | SelectPropertyConfig;
export type ShapeInspectorUpdateOptions = { resizeAxis?: "width" | "depth" | "height" };
type ShapeInspectorUpdate = (patch: Partial<WorkplaneShape>, options?: ShapeInspectorUpdateOptions) => void;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPanelNumber(value: number, accuracy: MeasurementAccuracy) {
  const zeroThreshold = 0.5 * 10 ** -accuracy;
  return (Math.abs(value) < zeroThreshold ? 0 : value).toFixed(accuracy);
}

function getShapeProperties(shape: WorkplaneShape, onUpdate: ShapeInspectorUpdate): ShapePropertyConfig[] {
  const width = shapeWidth(shape);
  const depth = shapeDepth(shape);
  const setWidth = (value: number) => onUpdate({ width: value, size: resizedShapeSize(value, depth) }, { resizeAxis: "width" });
  const setDepth = (value: number) => onUpdate({ depth: value, size: resizedShapeSize(width, value) }, { resizeAxis: "depth" });
  const setConeWidth = (value: number) => onUpdate({ width: value, baseRadius: value / 2, size: resizedShapeSize(value, depth) }, { resizeAxis: "width" });
  const setBaseRadius = (value: number) => {
    const diameter = value * 2;
    onUpdate({ baseRadius: value, width: diameter, size: resizedShapeSize(diameter, depth) }, { resizeAxis: "width" });
  };
  const setHeight = (height: number) => onUpdate({ height }, { resizeAxis: "height" });

  if (shape.kind === "box") {
    return [
      { label: "Fillet", value: shape.radius ?? 0, min: 0, max: 20, onChange: (radius) => onUpdate({ radius, chamfer: radius > 0 ? 0 : shape.chamfer }) },
      { label: "Chamfer", value: shape.chamfer ?? 0, min: 0, max: 20, onChange: (chamfer) => onUpdate({ chamfer, radius: chamfer > 0 ? 0 : shape.radius }) },
      { label: "Smoothness", value: shape.steps ?? 10, min: 1, max: 64, step: 1, onChange: (steps) => onUpdate({ steps: Math.round(steps) }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "cylinder") {
    return [
      { label: "Sides", value: shape.sides ?? 96, min: 3, max: 128, step: 1, onChange: (sides) => onUpdate({ sides: Math.round(sides) }) },
      { label: "Bevel", value: shape.bevel ?? 0, min: 0, max: 10, onChange: (bevel) => onUpdate({ bevel }) },
      { label: "Segments", value: shape.segments ?? 1, min: 1, max: 24, step: 1, onChange: (segments) => onUpdate({ segments: Math.round(segments) }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "sphere") {
    return [
      { label: "Steps", value: shape.steps ?? 24, min: 6, max: 64, step: 1, onChange: (steps) => onUpdate({ steps: Math.round(steps) }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "halfSphere") {
    return [
      { label: "Steps", value: shape.steps ?? 32, min: 6, max: 64, step: 1, onChange: (steps) => onUpdate({ steps: Math.round(steps) }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "cone") {
    return [
      { label: "Top Radius", value: shape.topRadius ?? 0, min: 0, max: 40, onChange: (topRadius) => onUpdate({ topRadius }) },
      { label: "Base Radius", value: shape.baseRadius ?? width / 2, min: MIN_SHAPE_SIZE, max: 80, onChange: setBaseRadius },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setConeWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
      { label: "Sides", value: shape.sides ?? 96, min: 3, max: 128, step: 1, onChange: (sides) => onUpdate({ sides: Math.round(sides) }) },
    ];
  }

  if (shape.kind === "pyramid") {
    return [
      { label: "Sides", value: shape.sides ?? 4, min: 3, max: 24, step: 1, onChange: (sides) => onUpdate({ sides: Math.round(sides) }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "roundRoof") {
    return [
      { label: "Sides", value: shape.sides ?? 64, min: 4, max: 128, step: 1, onChange: (sides) => onUpdate({ sides: Math.round(sides) }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "tube" || shape.kind === "ring") {
    return [
      { label: "Thickness", value: shape.bevel ?? 4, min: 0.5, max: 20, onChange: (bevel) => onUpdate({ bevel }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "capsule") {
    return [
      { label: "Sides", value: shape.sides ?? 32, min: 6, max: 64, step: 1, onChange: (sides) => onUpdate({ sides: Math.round(sides) }) },
      { label: "Cap steps", value: shape.steps ?? 16, min: 4, max: 32, step: 1, onChange: (steps) => onUpdate({ steps: Math.round(steps) }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "octahedron" || shape.kind === "dodecahedron") {
    return [
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "torusKnot") {
    return [
      { label: "Twist (p)", value: shape.knotP ?? 2, min: 1, max: 8, step: 1, onChange: (knotP) => onUpdate({ knotP: Math.round(knotP) }) },
      { label: "Loops (q)", value: shape.knotQ ?? 3, min: 1, max: 8, step: 1, onChange: (knotQ) => onUpdate({ knotQ: Math.round(knotQ) }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "gear") {
    return [
      { label: "Teeth", value: shape.teeth ?? 12, min: 4, max: 48, step: 1, onChange: (teeth) => onUpdate({ teeth: Math.round(teeth) }) },
      { label: "Tooth depth", value: shape.toothDepth ?? 2.4, min: 0.2, max: 12, onChange: (toothDepth) => onUpdate({ toothDepth }) },
      { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
      { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
    ];
  }

  if (shape.kind === "text") {
    return [
      {
        type: "text",
        label: "Text",
        value: shape.text ?? "TEXT",
        onChange: (text) => {
          const nextText = text.slice(0, 24) || " ";
          const nextWidth = clamp(Math.max(46, nextText.length * 19), 46, 260);
          onUpdate({ text: nextText, width: nextWidth, size: nextWidth });
        },
      },
      { type: "select", label: "Font", value: shape.font ?? "Multilanguage", options: TEXT_FONT_OPTIONS, onChange: (font) => onUpdate({ font }) },
      { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 40, onChange: setHeight },
      { label: "Bevel", value: shape.bevel ?? 0, min: 0, max: 8, onChange: (bevel) => onUpdate({ bevel }) },
      { label: "Segments", value: shape.segments ?? 0, min: 0, max: 24, step: 1, onChange: (segments) => onUpdate({ segments: Math.round(segments) }) },
    ];
  }

  return [
    { label: "Length", value: depth, min: MIN_SHAPE_SIZE, max: 160, onChange: setDepth },
    { label: "Width", value: width, min: MIN_SHAPE_SIZE, max: 160, onChange: setWidth },
    { label: "Height", value: shape.height, min: MIN_SHAPE_SIZE, max: 160, onChange: setHeight },
  ];
}

export function ShapeInspector({
  shape,
  snap,
  snapOpen,
  accuracy,
  onUpdate,
  onClose,
  onSnapChange,
  onSnapOpenChange,
}: {
  shape: WorkplaneShape;
  snap: GridSize;
  snapOpen: boolean;
  accuracy: MeasurementAccuracy;
  onUpdate: ShapeInspectorUpdate;
  onClose: () => void;
  onSnapChange: Dispatch<SetStateAction<GridSize>>;
  onSnapOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const solidColor = shape.hole ? fallbackSolidColor(shape) : shape.color;
  const locked = Boolean(shape.locked);
  const properties = getShapeProperties(shape, onUpdate);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(false);

  return (
    <aside className="shape-inspector" aria-label={`${shape.name} shape settings`} onPointerDown={(event) => event.stopPropagation()}>
      <div className="shape-inspector-header">
        <button className="inspector-header-icon" aria-label="Close shape settings" onClick={onClose}>
          <ChevronUp size={26} strokeWidth={2.8} />
        </button>
        <strong>{shape.name}</strong>
        <div className="inspector-header-actions">
          <button className={locked ? "inspector-header-icon active" : "inspector-header-icon"} aria-label={locked ? "Unlock shape" : "Lock shape"} onClick={() => onUpdate({ locked: !locked })}>
            {locked ? <LockKeyhole size={31} strokeWidth={2.4} /> : <LockKeyholeOpen size={31} strokeWidth={2.4} />}
          </button>
          <button className={shape.hidden ? "inspector-header-icon active" : "inspector-header-icon"} aria-label={shape.hidden ? "Show shape" : "Hide shape"} onClick={() => onUpdate({ hidden: !shape.hidden })}>
            <ToolbarHideSelectedIcon />
          </button>
        </div>
      </div>

      <div className="shape-state-card" role="group" aria-label="Shape mode">
        <button
          className={!shape.hole ? "active solid-choice" : "solid-choice"}
          onClick={() => {
            const wasHole = Boolean(shape.hole);
            onUpdate({ hole: false, color: solidColor });
            setColorOpen((open) => (wasHole ? false : !open));
          }}
          disabled={locked}
          aria-pressed={!shape.hole}
          aria-expanded={colorOpen}
        >
          <span className="large-solid-swatch" style={{ "--swatch": solidColor } as CSSProperties} />
          <span>Solid</span>
        </button>
        <button
          className={shape.hole ? "active hole-choice" : "hole-choice"}
          onClick={() => {
            onUpdate({ hole: true, color: "#b8c2cc" });
            setColorOpen(false);
          }}
          disabled={locked}
          aria-pressed={shape.hole}
        >
          <span className="large-hole-swatch" />
          <span>Hole</span>
        </button>
      </div>

      {colorOpen ? (
        <div className="color-card" aria-label="Shape color">
          <div className="color-card-header">
            <span>Color</span>
            <span className="color-value">{solidColor.toUpperCase()}</span>
          </div>
          <div className="color-grid">
            {SOLID_COLORS.map((color) => (
              <button
                key={color}
                className={solidColor.toLowerCase() === color.toLowerCase() && !shape.hole ? "selected" : ""}
                type="button"
                style={{ "--shape-swatch": color } as CSSProperties}
                title={color.toUpperCase()}
                aria-label={`Set color ${color}`}
                disabled={locked}
                onClick={() => {
                  onUpdate({ color, hole: false });
                  setColorOpen(false);
                }}
              />
            ))}
            <label className={locked ? "custom-color disabled" : "custom-color"} title="Custom color">
              <input
                type="color"
                value={solidColor}
                disabled={locked}
                onChange={(event) => {
                  onUpdate({ color: event.target.value, hole: false });
                  setColorOpen(false);
                }}
              />
              <span>Custom</span>
            </label>
          </div>
        </div>
      ) : null}

      <div className="property-card">
        <button
          className="property-card-header"
          type="button"
          aria-expanded={propertiesOpen}
          aria-controls={`properties-${shape.id}`}
          onClick={() => setPropertiesOpen((open) => !open)}
        >
          <span>Properties</span>
          <ChevronUp className={propertiesOpen ? "" : "collapsed"} size={25} strokeWidth={2.8} />
        </button>
        {propertiesOpen ? (
          <div className="property-list" id={`properties-${shape.id}`}>
            {properties.map((property) => {
              if (property.type === "text") {
                return <TextProperty key={property.label} {...property} disabled={locked} />;
              }
              if (property.type === "select") {
                return <SelectProperty key={property.label} {...property} disabled={locked} />;
              }
              return <RangeProperty key={property.label} {...property} accuracy={accuracy} disabled={locked} />;
            })}
          </div>
        ) : null}
      </div>
      <div className="inspector-snap-dock">
        <SnapGridControl snap={snap} snapOpen={snapOpen} onSnapChange={onSnapChange} onSnapOpenChange={onSnapOpenChange} />
      </div>
    </aside>
  );
}

export function SnapGridControl({
  snap,
  snapOpen,
  onSnapChange,
  onSnapOpenChange,
}: {
  snap: GridSize;
  snapOpen: boolean;
  onSnapChange: Dispatch<SetStateAction<GridSize>>;
  onSnapOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="snap-row">
      <span>Snap Grid</span>
      <button className="snap-select" onClick={() => onSnapOpenChange((value) => !value)}>
        {snap}
        <ChevronDown size={12} fill="currentColor" />
      </button>
      {snapOpen ? (
        <div className="snap-menu">
          {GRID_SIZES.map((size) => (
            <button
              key={size}
              className={size === snap ? "selected" : ""}
              onClick={() => {
                onSnapChange(size);
                onSnapOpenChange(false);
              }}
            >
              {size}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RangeProperty({
  label,
  value,
  min,
  max,
  step = 0.01,
  accuracy,
  disabled,
  onChange,
}: RangePropertyConfig & { accuracy: MeasurementAccuracy; disabled?: boolean }) {
  const allowsAboveSliderMax = label === "Length" || label === "Width" || label === "Height";
  const actualValue = Math.max(min, Number.isFinite(value) ? value : min);
  const sliderValue = clamp(actualValue, min, max);
  const position = ((sliderValue - min) / Math.max(1, max - min)) * 100;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(formatPanelNumber(actualValue, accuracy));
  useEffect(() => {
    if (!editing) {
      setDraft(formatPanelNumber(actualValue, accuracy));
    }
  }, [accuracy, actualValue, editing]);
  const commitDraft = () => {
    const next = Number(draft);
    const finiteNext = Number.isFinite(next) ? next : actualValue;
    onChange(allowsAboveSliderMax ? Math.max(min, finiteNext) : clamp(finiteNext, min, max));
    setEditing(false);
  };
  return (
    <label className="range-property" style={{ "--slider-pos": `${position}%` } as CSSProperties}>
      <span>{label}</span>
      <div className="range-control">
        {editing ? (
          <input
            className="range-value-input"
            type="number"
            min={min}
            max={allowsAboveSliderMax ? undefined : max}
            step={step}
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.currentTarget.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              } else if (event.key === "Escape") {
                setDraft(formatPanelNumber(actualValue, accuracy));
                setEditing(false);
              }
            }}
          />
        ) : (
          <output
            onDoubleClick={(event) => {
              if (disabled) {
                return;
              }
              event.preventDefault();
              setDraft(formatPanelNumber(actualValue, accuracy));
              setEditing(true);
            }}
          >
            {formatPanelNumber(actualValue, accuracy)}
          </output>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          disabled={disabled}
          onChange={(event) => {
            const next = Number(event.currentTarget.value);
            onChange(clamp(Number.isFinite(next) ? next : min, min, max));
          }}
        />
      </div>
    </label>
  );
}

function TextProperty({ label, value, disabled, onChange }: TextPropertyConfig & { disabled?: boolean }) {
  return (
    <label className="text-property">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        maxLength={24}
        spellCheck={false}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function SelectProperty({ label, value, options, disabled, onChange }: SelectPropertyConfig & { disabled?: boolean }) {
  return (
    <label className="select-property">
      <span>{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.currentTarget.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
