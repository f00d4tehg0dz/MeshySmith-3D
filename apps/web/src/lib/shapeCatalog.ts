import { canonicalizeShape } from "@/lib/workplaneShapes";
import { createLocalId } from "@/lib/localIds";
import type { ShapeAsset, WorkplaneShape } from "@/types/meshysmith";

export type ShapeCategory = "basic" | "curved" | "polyhedra" | "mechanical" | "type";

export type ToolbarShapeAsset = ShapeAsset & {
  menuIcon: string;
  category: ShapeCategory;
  keywords?: string[];
};

export const shapeCategoryLabels: Record<ShapeCategory, string> = {
  basic: "Basic",
  curved: "Curved",
  polyhedra: "Polyhedra",
  mechanical: "Mechanical",
  type: "Type",
};

export const shapeCategoryOrder: ShapeCategory[] = ["basic", "curved", "polyhedra", "mechanical", "type"];

const ICON_BASE = "assets/meshysmith/shapes";

export const toolbarShapeAssets: ToolbarShapeAsset[] = [
  { id: "box", name: "Box", src: `${ICON_BASE}/box.svg`, menuIcon: `${ICON_BASE}/box.svg`, kind: "box", color: "#d41721", category: "basic", keywords: ["cube", "block", "rectangle"] },
  { id: "cylinder", name: "Cylinder", src: `${ICON_BASE}/cylinder.svg`, menuIcon: `${ICON_BASE}/cylinder.svg`, kind: "cylinder", color: "#d97813", category: "basic", keywords: ["tube", "rod", "post"] },
  { id: "sphere", name: "Sphere", src: `${ICON_BASE}/sphere.svg`, menuIcon: `${ICON_BASE}/sphere.svg`, kind: "sphere", color: "#0098c7", category: "basic", keywords: ["ball", "round"] },
  { id: "cone", name: "Cone", src: `${ICON_BASE}/cone.svg`, menuIcon: `${ICON_BASE}/cone.svg`, kind: "cone", color: "#6e2786", category: "basic" },
  { id: "pyramid", name: "Pyramid", src: `${ICON_BASE}/pyramid.svg`, menuIcon: `${ICON_BASE}/pyramid.svg`, kind: "pyramid", color: "#f2cf10", category: "basic" },
  { id: "wedge", name: "Wedge", src: `${ICON_BASE}/wedge.svg`, menuIcon: `${ICON_BASE}/wedge.svg`, kind: "wedge", color: "#33983d", category: "basic", keywords: ["ramp", "triangle"] },

  { id: "round-roof", name: "Round Roof", src: `${ICON_BASE}/round-roof.svg`, menuIcon: `${ICON_BASE}/round-roof.svg`, kind: "roundRoof", color: "#67c4ce", category: "curved", keywords: ["arch"] },
  { id: "half-sphere", name: "Half Sphere", src: `${ICON_BASE}/half-sphere.svg`, menuIcon: `${ICON_BASE}/half-sphere.svg`, kind: "halfSphere", color: "#c9009a", category: "curved", keywords: ["dome", "bowl"] },
  { id: "torus", name: "Torus", src: `${ICON_BASE}/torus.svg`, menuIcon: `${ICON_BASE}/torus.svg`, kind: "torus", color: "#0098c7", category: "curved", keywords: ["donut", "ring"] },
  { id: "tube", name: "Tube", src: `${ICON_BASE}/tube.svg`, menuIcon: `${ICON_BASE}/tube.svg`, kind: "tube", color: "#ce7013", category: "curved", keywords: ["pipe", "hollow"] },
  { id: "capsule", name: "Capsule", src: `${ICON_BASE}/capsule.svg`, menuIcon: `${ICON_BASE}/capsule.svg`, kind: "capsule", color: "#2dc7d4", category: "curved", keywords: ["pill", "stadium"] },

  { id: "octahedron", name: "Octahedron", src: `${ICON_BASE}/octahedron.svg`, menuIcon: `${ICON_BASE}/octahedron.svg`, kind: "octahedron", color: "#d97813", category: "polyhedra", keywords: ["d8", "platonic"] },
  { id: "dodecahedron", name: "Dodecahedron", src: `${ICON_BASE}/dodecahedron.svg`, menuIcon: `${ICON_BASE}/dodecahedron.svg`, kind: "dodecahedron", color: "#9b6cd6", category: "polyhedra", keywords: ["d12", "platonic"] },

  { id: "torus-knot", name: "Torus Knot", src: `${ICON_BASE}/torus-knot.svg`, menuIcon: `${ICON_BASE}/torus-knot.svg`, kind: "torusKnot", color: "#0098c7", category: "mechanical", keywords: ["knot", "twist"] },
  { id: "gear", name: "Gear", src: `${ICON_BASE}/gear.svg`, menuIcon: `${ICON_BASE}/gear.svg`, kind: "gear", color: "#7a8da0", category: "mechanical", keywords: ["cog", "wheel", "teeth"] },

  { id: "text", name: "Text", src: `${ICON_BASE}/text.svg`, menuIcon: `${ICON_BASE}/text.svg`, kind: "text", color: "#cf101b", category: "type", keywords: ["letter", "word"] },
];

export function filterShapeAssets(query: string, category: ShapeCategory | "all"): ToolbarShapeAsset[] {
  const q = query.trim().toLowerCase();
  return toolbarShapeAssets.filter((asset) => {
    if (category !== "all" && asset.category !== category) return false;
    if (!q) return true;
    if (asset.name.toLowerCase().includes(q)) return true;
    if (asset.id.toLowerCase().includes(q)) return true;
    return asset.keywords?.some((kw) => kw.includes(q)) ?? false;
  });
}

export function sceneShape(shape: Partial<WorkplaneShape> & Pick<WorkplaneShape, "name" | "kind" | "color">): WorkplaneShape {
  const width = shape.width ?? shape.size ?? 20;
  const depth = shape.depth ?? shape.size ?? 20;
  const height = shape.height ?? 20;
  return canonicalizeShape({
    id: shape.id ?? createLocalId("shape"),
    name: shape.name,
    kind: shape.kind,
    color: shape.color,
    hole: shape.hole,
    x: shape.x ?? 0,
    z: shape.z ?? 0,
    elevation: shape.elevation ?? 0,
    size: shape.size ?? Math.max(width, depth),
    width,
    depth,
    height,
    rotation: shape.rotation ?? 0,
    rotationX: shape.rotationX ?? 0,
    rotationZ: shape.rotationZ ?? 0,
    radius: shape.radius,
    steps: shape.steps,
    sides: shape.sides,
    bevel: shape.bevel,
    segments: shape.segments,
    topRadius: shape.topRadius,
    baseRadius: shape.baseRadius,
    text: shape.text,
    font: shape.font,
    importedMesh: shape.importedMesh,
    imagePlate: shape.imagePlate,
    groupedShapes: shape.groupedShapes,
    groupedBaseWidth: shape.groupedBaseWidth,
    groupedBaseDepth: shape.groupedBaseDepth,
    groupedBaseHeight: shape.groupedBaseHeight,
    locked: shape.locked ?? false,
    hidden: shape.hidden ?? false,
  });
}

export function makeShapeFromAsset(asset: ShapeAsset, point?: { x: number; z: number; elevation?: number }): WorkplaneShape {
  const roundProfile = asset.kind === "sphere" || asset.kind === "torus" || asset.kind === "ring" || asset.kind === "halfSphere";
  const flatProfile = asset.kind === "torus" || asset.kind === "ring" || asset.kind === "text";
  const tallProfile = asset.kind === "capsule";
  const size = roundProfile ? 22 : 20;
  const height = asset.kind === "text"
    ? 10
    : asset.kind === "roundRoof"
      ? 10
      : asset.kind === "halfSphere"
        ? 11
        : tallProfile
          ? 36
          : flatProfile
            ? 5
            : 20;
  const width = asset.kind === "text" ? 86 : size;
  const depth = asset.kind === "text" ? 28 : size;

  return {
    id: createLocalId(asset.id),
    name: asset.name,
    kind: asset.kind,
    color: asset.color,
    hole: asset.hole,
    x: point?.x ?? 0,
    z: point?.z ?? 0,
    elevation: point?.elevation ?? 0,
    size,
    width,
    depth,
    height,
    rotation: 0,
    rotationX: 0,
    rotationZ: 0,
    radius: asset.kind === "box" ? 0 : undefined,
    chamfer: asset.kind === "box" ? 0 : undefined,
    text: asset.kind === "text" ? "TEXT" : undefined,
    font: asset.kind === "text" ? "Multilanguage" : undefined,
    steps: asset.kind === "box"
      ? 10
      : asset.kind === "sphere"
        ? 24
        : asset.kind === "halfSphere"
          ? 32
          : asset.kind === "capsule"
            ? 16
            : undefined,
    sides: asset.kind === "cylinder" || asset.kind === "cone"
      ? 96
      : asset.kind === "roundRoof"
        ? 64
        : asset.kind === "pyramid"
          ? 4
          : asset.kind === "capsule"
            ? 32
            : undefined,
    bevel: asset.kind === "cylinder" ? 0 : asset.kind === "tube" || asset.kind === "ring" ? 4 : undefined,
    segments: asset.kind === "cylinder" ? 1 : undefined,
    topRadius: asset.kind === "cone" ? 0 : undefined,
    baseRadius: asset.kind === "cone" ? size / 2 : undefined,
    teeth: asset.kind === "gear" ? 12 : undefined,
    toothDepth: asset.kind === "gear" ? 2.4 : undefined,
    knotP: asset.kind === "torusKnot" ? 2 : undefined,
    knotQ: asset.kind === "torusKnot" ? 3 : undefined,
    locked: false,
    hidden: false,
  };
}
