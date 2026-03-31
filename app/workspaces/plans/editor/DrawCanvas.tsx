"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import toast from "react-hot-toast";

// ── LatLng-based types ──────────────────────────────────────────────────────

type LatLng = { lat: number; lng: number };

type GeoFreehand = {
  type: "freehand";
  points: LatLng[];
  color: string;
  width: number;
  opacity: number;
};

type GeoLine = {
  type: "line";
  start: LatLng;
  end: LatLng;
  color: string;
  width: number;
  opacity: number;
};

type GeoRect = {
  type: "rect";
  topLeft: LatLng;
  bottomRight: LatLng;
  color: string;
  width: number;
  opacity: number;
  filled: boolean;
};

type GeoCircle = {
  type: "circle";
  center: LatLng;
  radiusLat: number;
  radiusLng: number;
  color: string;
  width: number;
  opacity: number;
  filled: boolean;
};

type GeoText = {
  type: "text";
  anchor: LatLng;
  text: string;
  color: string;
  fontSize: number;
  opacity: number;
};

type GeoEraser = {
  type: "eraser";
  points: LatLng[];
  width: number;
};

type GeoStroke =
  | GeoFreehand
  | GeoLine
  | GeoRect
  | GeoCircle
  | GeoText
  | GeoEraser;

type Tool = "pan" | "pen" | "line" | "rect" | "circle" | "text" | "eraser";

// ── Layer type ──────────────────────────────────────────────────────────────

export interface GeoLayerData {
  id: number;
  layer_name: string;
  layer_order: number;
  has_image: boolean;
  visible: boolean;
  locked: boolean;
  opacity: number;
  strokes: GeoStroke[];
  blobUrl?: string;
}

// Keep the old export name for compatibility with page.tsx import if needed
export type LayerData = GeoLayerData;

// ── Props ───────────────────────────────────────────────────────────────────

interface DrawCanvasProps {
  visible: boolean;
  workspaceId: number;
  token: string;
  userId: number;
  leafletMap?: any;
}

// ── Tool definitions ────────────────────────────────────────────────────────

const TOOLS: { id: Tool; label: string; shortcut: string }[] = [
  { id: "pan", label: "Pan", shortcut: "V" },
  { id: "pen", label: "Pen", shortcut: "P" },
  { id: "line", label: "Line", shortcut: "L" },
  { id: "rect", label: "Rect", shortcut: "R" },
  { id: "circle", label: "Circle", shortcut: "C" },
  { id: "text", label: "Text", shortcut: "X" },
  { id: "eraser", label: "Eraser", shortcut: "E" },
];

const SHORTCUT_MAP: Record<string, Tool> = {
  v: "pan",
  p: "pen",
  l: "line",
  r: "rect",
  c: "circle",
  x: "text",
  e: "eraser",
};

const MAX_HISTORY = 50;

// ── Helpers ─────────────────────────────────────────────────────────────────

function toPixel(map: any, ll: LatLng): { x: number; y: number } {
  const pt = map.latLngToContainerPoint([ll.lat, ll.lng]);
  return { x: pt.x, y: pt.y };
}

function toLatLng(map: any, x: number, y: number): LatLng {
  const ll = map.containerPointToLatLng([x, y]);
  return { lat: ll.lat, lng: ll.lng };
}

function latLngDist(a: LatLng, b: LatLng): number {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}

// ── Component ───────────────────────────────────────────────────────────────

export default function DrawCanvas({
  visible,
  workspaceId,
  token,
  userId,
  leafletMap,
}: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const currentStrokeRef = useRef<LatLng[]>([]);
  const dragStartRef = useRef<LatLng | null>(null);

  // ── State ──
  const [tool, setTool] = useState<Tool>("pen");
  const toolRef = useRef<Tool>("pen");
  const preSpaceToolRef = useRef<Tool | null>(null);

  const [color, setColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [opacity, setOpacity] = useState(100);
  const [fontSize, setFontSize] = useState(20);
  const [filled, setFilled] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const [layers, setLayers] = useState<GeoLayerData[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<number | null>(null);
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);
  const [renamingLayerId, setRenamingLayerId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Undo/redo: stores snapshots of all layers' strokes
  const [history, setHistory] = useState<GeoLayerData[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<GeoLayerData[][]>([]);
  const historyIndexRef = useRef(-1);

  const [isPanning, setIsPanning] = useState(false);

  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    latLng: LatLng;
    value: string;
  }>({ visible: false, x: 0, y: 0, latLng: { lat: 0, lng: 0 }, value: "" });

  // Preview state for shape tools (line, rect, circle)
  const [preview, setPreview] = useState<{
    start: LatLng;
    end: LatLng;
  } | null>(null);

  const wsId = workspaceId.toString();

  // Keep refs in sync
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  // Enable/disable Leaflet dragging when pan tool is selected
  useEffect(() => {
    if (!leafletMap) return;
    if (tool === "pan") {
      leafletMap.dragging.enable();
    } else if (!isPanning) {
      leafletMap.dragging.disable();
    }
  }, [tool, leafletMap, isPanning]);
  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  // ── Undo / Redo helpers ─────────────────────────────────────────────────

  const pushSnapshot = useCallback(
    (newLayers: GeoLayerData[]) => {
      const snapshot = newLayers.map((l) => ({
        ...l,
        strokes: [...l.strokes],
      }));
      const currentHistory = historyRef.current;
      const currentIndex = historyIndexRef.current;
      // Trim any redo states
      const trimmed = currentHistory.slice(0, currentIndex + 1);
      const next = [...trimmed, snapshot].slice(-MAX_HISTORY);
      setHistory(next);
      setHistoryIndex(next.length - 1);
    },
    [],
  );

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    const newIdx = idx - 1;
    setHistoryIndex(newIdx);
    const snapshot = historyRef.current[newIdx];
    if (snapshot) {
      setLayers(snapshot.map((l) => ({ ...l, strokes: [...l.strokes] })));
    }
  }, []);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    const hist = historyRef.current;
    if (idx >= hist.length - 1) return;
    const newIdx = idx + 1;
    setHistoryIndex(newIdx);
    const snapshot = hist[newIdx];
    if (snapshot) {
      setLayers(snapshot.map((l) => ({ ...l, strokes: [...l.strokes] })));
    }
  }, []);

  // ── Canvas sizing ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!visible) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    return () => observer.disconnect();
  }, [visible]);

  // ── Drawing primitives (pixel-based, used during redraw) ────────────────

  const drawFreehandPx = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      map: any,
      stroke: GeoFreehand,
    ) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.globalAlpha = stroke.opacity / 100;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const p0 = toPixel(map, stroke.points[0]);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < stroke.points.length; i++) {
        const p = toPixel(map, stroke.points[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    },
    [],
  );

  const drawLinePx = useCallback(
    (ctx: CanvasRenderingContext2D, map: any, stroke: GeoLine) => {
      ctx.save();
      ctx.globalAlpha = stroke.opacity / 100;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      const a = toPixel(map, stroke.start);
      const b = toPixel(map, stroke.end);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    },
    [],
  );

  const drawRectPx = useCallback(
    (ctx: CanvasRenderingContext2D, map: any, stroke: GeoRect) => {
      const tl = toPixel(map, stroke.topLeft);
      const br = toPixel(map, stroke.bottomRight);
      const w = br.x - tl.x;
      const h = br.y - tl.y;
      ctx.save();
      ctx.globalAlpha = stroke.opacity / 100;
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      if (stroke.filled) {
        ctx.fillRect(tl.x, tl.y, w, h);
      }
      ctx.strokeRect(tl.x, tl.y, w, h);
      ctx.restore();
    },
    [],
  );

  const drawCirclePx = useCallback(
    (ctx: CanvasRenderingContext2D, map: any, stroke: GeoCircle) => {
      const c = toPixel(map, stroke.center);
      const edge = toPixel(map, {
        lat: stroke.center.lat + stroke.radiusLat,
        lng: stroke.center.lng + stroke.radiusLng,
      });
      const rx = Math.abs(edge.x - c.x);
      const ry = Math.abs(edge.y - c.y);
      ctx.save();
      ctx.globalAlpha = stroke.opacity / 100;
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, rx || 1, ry || 1, 0, 0, Math.PI * 2);
      if (stroke.filled) ctx.fill();
      ctx.stroke();
      ctx.restore();
    },
    [],
  );

  const drawTextPx = useCallback(
    (ctx: CanvasRenderingContext2D, map: any, stroke: GeoText) => {
      const p = toPixel(map, stroke.anchor);
      // Scale font size with zoom: use a reference zoom level
      const zoom = map.getZoom();
      const scaledFontSize = stroke.fontSize * Math.pow(2, zoom - 11);
      ctx.save();
      ctx.globalAlpha = stroke.opacity / 100;
      ctx.fillStyle = stroke.color;
      ctx.font = `bold ${Math.max(4, scaledFontSize)}px sans-serif`;
      ctx.fillText(stroke.text, p.x, p.y);
      ctx.restore();
    },
    [],
  );

  const drawEraserPx = useCallback(
    (ctx: CanvasRenderingContext2D, map: any, stroke: GeoEraser) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const p0 = toPixel(map, stroke.points[0]);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < stroke.points.length; i++) {
        const p = toPixel(map, stroke.points[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    },
    [],
  );

  const drawStroke = useCallback(
    (ctx: CanvasRenderingContext2D, map: any, stroke: GeoStroke) => {
      switch (stroke.type) {
        case "freehand":
          drawFreehandPx(ctx, map, stroke);
          break;
        case "line":
          drawLinePx(ctx, map, stroke);
          break;
        case "rect":
          drawRectPx(ctx, map, stroke);
          break;
        case "circle":
          drawCirclePx(ctx, map, stroke);
          break;
        case "text":
          drawTextPx(ctx, map, stroke);
          break;
        case "eraser":
          drawEraserPx(ctx, map, stroke);
          break;
      }
    },
    [drawFreehandPx, drawLinePx, drawRectPx, drawCirclePx, drawTextPx, drawEraserPx],
  );

  // ── Full redraw (called on every map move/zoom) ─────────────────────────

  const layersRef = useRef<GeoLayerData[]>([]);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  const previewRef = useRef(preview);
  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  const colorRef = useRef(color);
  const strokeWidthRef = useRef(strokeWidth);
  const opacityRef = useRef(opacity);
  const filledRef = useRef(filled);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { opacityRef.current = opacity; }, [opacity]);
  useEffect(() => { filledRef.current = filled; }, [filled]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !leafletMap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    // Draw all visible layers' strokes
    for (const layer of layersRef.current) {
      if (!layer.visible) continue;
      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      for (const stroke of layer.strokes) {
        drawStroke(ctx, leafletMap, stroke);
      }
      ctx.restore();
    }

    // Draw preview shape for line/rect/circle
    const prev = previewRef.current;
    if (prev && isDrawingRef.current) {
      const currentTool = toolRef.current;
      ctx.save();
      ctx.globalAlpha = opacityRef.current / 100;
      ctx.strokeStyle = colorRef.current;
      ctx.fillStyle = colorRef.current;
      ctx.lineWidth = strokeWidthRef.current;
      ctx.lineCap = "round";
      ctx.setLineDash([6, 4]);

      if (currentTool === "line") {
        const a = toPixel(leafletMap, prev.start);
        const b = toPixel(leafletMap, prev.end);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      } else if (currentTool === "rect") {
        const tl = toPixel(leafletMap, prev.start);
        const br = toPixel(leafletMap, prev.end);
        const rw = br.x - tl.x;
        const rh = br.y - tl.y;
        if (filledRef.current) ctx.fillRect(tl.x, tl.y, rw, rh);
        ctx.strokeRect(tl.x, tl.y, rw, rh);
      } else if (currentTool === "circle") {
        const c = toPixel(leafletMap, prev.start);
        const e = toPixel(leafletMap, prev.end);
        const rx = Math.abs(e.x - c.x);
        const ry = Math.abs(e.y - c.y);
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, rx || 1, ry || 1, 0, 0, Math.PI * 2);
        if (filledRef.current) ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw in-progress freehand/eraser
    if (
      isDrawingRef.current &&
      currentStrokeRef.current.length >= 2 &&
      (toolRef.current === "pen" || toolRef.current === "eraser")
    ) {
      const pts = currentStrokeRef.current;
      ctx.save();
      if (toolRef.current === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = strokeWidthRef.current;
      } else {
        ctx.globalAlpha = opacityRef.current / 100;
        ctx.strokeStyle = colorRef.current;
        ctx.lineWidth = strokeWidthRef.current;
      }
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const p0 = toPixel(leafletMap, pts[0]);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < pts.length; i++) {
        const p = toPixel(leafletMap, pts[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [leafletMap, drawStroke]);

  // ── Map move/zoom sync — redraw on every frame ──────────────────────────

  useEffect(() => {
    if (!leafletMap || !visible) return;

    let rafId: number;
    const loop = () => {
      redraw();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [leafletMap, visible, redraw]);

  // ── Forward scroll wheel to Leaflet ─────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !visible || !leafletMap) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) leafletMap.zoomIn(1);
      else leafletMap.zoomOut(1);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [leafletMap, visible]);

  // ── Space bar hold to pan ───────────────────────────────────────────────

  useEffect(() => {
    if (!visible || !leafletMap) return;

    const startPan = () => {
      isPanningRef.current = true;
      setIsPanning(true);
      leafletMap.dragging.enable();
    };
    const stopPan = () => {
      isPanningRef.current = false;
      setIsPanning(false);
      leafletMap.dragging.disable();
      // Restore tool from before Space was held
      if (preSpaceToolRef.current !== null) {
        preSpaceToolRef.current = null;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        preSpaceToolRef.current = toolRef.current;
        startPan();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        stopPan();
      }
    };

    (window as any).__evStartPan = startPan;
    (window as any).__evStopPan = stopPan;

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      isPanningRef.current = false;
      setIsPanning(false);
      delete (window as any).__evStartPan;
      delete (window as any).__evStopPan;
    };
  }, [visible, leafletMap]);

  // ── Middle mouse to pan ─────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !visible || !leafletMap) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      if ((window as any).__evStartPan) (window as any).__evStartPan();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 1) return;
      if ((window as any).__evStopPan) (window as any).__evStopPan();
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointerup", onPointerUp);
    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointerup", onPointerUp);
    };
  }, [visible, leafletMap]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Ctrl+Z / Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // ? toggle legend
      if (e.key === "?") {
        setShowLegend((p) => !p);
        return;
      }

      // Tool shortcuts
      const mapped = SHORTCUT_MAP[e.key.toLowerCase()];
      if (mapped && !e.ctrlKey && !e.metaKey) {
        setTool(mapped);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, undo, redo]);

  // ── API: fetch layers ───────────────────────────────────────────────────

  const fetchLayers = useCallback(async () => {
    try {
      const res = await OLF.post(
        ApiLinks.drawingLayers.list(wsId),
        {},
        undefined,
        token,
      );

      const serverLayers: {
        id: number;
        layer_name: string;
        layer_order: number;
        has_image: boolean;
      }[] = res ?? [];

      const newLayers: GeoLayerData[] = serverLayers.map((l) => ({
        id: l.id,
        layer_name: l.layer_name,
        layer_order: l.layer_order,
        has_image: l.has_image,
        visible: true,
        locked: false,
        opacity: 100,
        strokes: [],
      }));

      setLayers(newLayers);

      // Try to load georef data
      try {
        const response = await fetch(
          ApiLinks.drawingLayers.georefLoad(wsId),
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const georefData = await response.json();
          if (georefData?.layers && Array.isArray(georefData.layers)) {
            setLayers((prev) =>
              prev.map((layer) => {
                const saved = georefData.layers.find(
                  (s: any) => s.id === layer.id,
                );
                if (saved) {
                  return {
                    ...layer,
                    strokes: saved.strokes || [],
                    locked: saved.locked ?? false,
                    opacity: saved.opacity ?? 100,
                  };
                }
                return layer;
              }),
            );
          }
        }
      } catch {
        // Georef data not available yet, that's fine
      }
    } catch (error) {
      console.error("Error fetching drawing layers:", error);
    }
  }, [wsId, token]);

  useEffect(() => {
    if (visible) fetchLayers();
  }, [visible, fetchLayers]);

  // Initialize history after layers load
  useEffect(() => {
    if (layers.length > 0 && history.length === 0) {
      const initial = layers.map((l) => ({ ...l, strokes: [...l.strokes] }));
      setHistory([initial]);
      setHistoryIndex(0);
    }
  }, [layers.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── API: create layer ───────────────────────────────────────────────────

  const handleCreateLayer = async () => {
    try {
      const res = await OLF.post(
        ApiLinks.drawingLayers.create(wsId),
        { user_id: userId, layer_name: `Layer ${layers.length + 1}` },
        undefined,
        token,
      );
      if (res) {
        const newLayer: GeoLayerData = {
          id: res.id,
          layer_name: res.layer_name,
          layer_order: res.layer_order,
          has_image: false,
          visible: true,
          locked: false,
          opacity: 100,
          strokes: [],
        };
        const newLayers = [...layers, newLayer];
        setLayers(newLayers);
        setActiveLayerId(res.id);
        pushSnapshot(newLayers);
      }
    } catch (error) {
      console.error("Error creating layer:", error);
      toast.error("Failed to create layer");
    }
  };

  // ── API: rename layer ───────────────────────────────────────────────────

  const handleRenameSubmit = async (layerId: number, newName: string) => {
    if (!newName.trim()) {
      setRenamingLayerId(null);
      return;
    }
    try {
      await OLF.put(
        ApiLinks.drawingLayers.rename(wsId, layerId.toString()),
        { layer_name: newName },
        undefined,
        token,
      );
      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId ? { ...l, layer_name: newName } : l,
        ),
      );
    } catch (error) {
      console.error("Error renaming layer:", error);
      toast.error("Failed to rename layer");
    }
    setRenamingLayerId(null);
  };

  // ── API: delete layer ───────────────────────────────────────────────────

  const handleDeleteLayer = async (layerId: number) => {
    try {
      await OLF.delete(
        ApiLinks.drawingLayers.delete(wsId, layerId.toString()),
        undefined,
        undefined,
        token,
      );
      const newLayers = layers.filter((l) => l.id !== layerId);
      setLayers(newLayers);
      if (activeLayerId === layerId) setActiveLayerId(null);
      pushSnapshot(newLayers);
      toast.success("Layer deleted");
    } catch (error) {
      console.error("Error deleting layer:", error);
      toast.error("Failed to delete layer");
    }
  };

  // ── API: reorder layers ─────────────────────────────────────────────────

  const handleMoveLayer = async (
    layerId: number,
    direction: "up" | "down",
  ) => {
    const idx = layers.findIndex((l) => l.id === layerId);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= layers.length) return;

    const newLayers = [...layers];
    [newLayers[idx], newLayers[newIdx]] = [newLayers[newIdx], newLayers[idx]];
    setLayers(newLayers);

    try {
      await OLF.put(
        ApiLinks.drawingLayers.reorder(wsId),
        { layer_ids: newLayers.map((l) => l.id) },
        undefined,
        token,
      );
    } catch (error) {
      console.error("Error reordering layers:", error);
    }
  };

  // ── API: save PNG (legacy per-layer) ────────────────────────────────────

  const handleSave = async () => {
    if (!activeLayerId) {
      toast.error("Select a layer first");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);

    // Create a temp canvas with only the active layer's strokes
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = canvas.width;
    tmpCanvas.height = canvas.height;
    const tmpCtx = tmpCanvas.getContext("2d");
    if (tmpCtx && leafletMap) {
      const dpr = window.devicePixelRatio || 1;
      tmpCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const activeLayer = layers.find((l) => l.id === activeLayerId);
      if (activeLayer) {
        for (const stroke of activeLayer.strokes) {
          drawStroke(tmpCtx, leafletMap, stroke);
        }
      }
    }

    tmpCanvas.toBlob(
      async (blob) => {
        if (!blob) {
          setSaving(false);
          return;
        }
        try {
          const formData = new FormData();
          formData.append("file", blob, "layer.png");

          const response = await fetch(
            ApiLinks.drawingLayers.saveImage(
              wsId,
              activeLayerId.toString(),
            ),
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
          );

          if (!response.ok) throw new Error("Failed to save layer image");

          // Also save georef data
          await saveGeorefData();

          toast.success("Layer saved!");
        } catch (error) {
          console.error("Error saving layer:", error);
          toast.error("Failed to save layer");
        }
        setSaving(false);
      },
      "image/png",
    );
  };

  // ── API: save georef data ───────────────────────────────────────────────

  const saveGeorefData = async () => {
    try {
      const payload = {
        layers: layers.map((l) => ({
          id: l.id,
          strokes: l.strokes,
          locked: l.locked,
          opacity: l.opacity,
        })),
      };
      const response = await fetch(
        ApiLinks.drawingLayers.georefSave(wsId),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Failed to save georef data");
    } catch (error) {
      console.error("Error saving georef data:", error);
    }
  };

  // ── Export PNG ──────────────────────────────────────────────────────────

  const handleExportPng = () => {
    if (!leafletMap) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const offscreen = document.createElement("canvas");
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const layer of layers) {
      if (!layer.visible) continue;
      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      for (const stroke of layer.strokes) {
        drawStroke(ctx, leafletMap, stroke);
      }
      ctx.restore();
    }

    offscreen.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `drawing-export-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // ── Mouse coordinate helper ─────────────────────────────────────────────

  const getMouseLatLng = (e: React.MouseEvent): LatLng => {
    if (!leafletMap) return { lat: 0, lng: 0 };
    const container = containerRef.current;
    if (!container) return { lat: 0, lng: 0 };
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return toLatLng(leafletMap, x, y);
  };

  const getMouseContainerPt = (
    e: React.MouseEvent,
  ): { x: number; y: number } => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // ── Active layer helper ─────────────────────────────────────────────────

  const getActiveLayer = (): GeoLayerData | undefined =>
    layers.find((l) => l.id === activeLayerId);

  const isLayerEditable = (): boolean => {
    const layer = getActiveLayer();
    return !!layer && layer.visible && !layer.locked;
  };

  // ── Add stroke to active layer ──────────────────────────────────────────

  const addStrokeToActiveLayer = useCallback(
    (stroke: GeoStroke) => {
      setLayers((prev) => {
        const newLayers = prev.map((l) =>
          l.id === activeLayerId
            ? { ...l, strokes: [...l.strokes, stroke] }
            : l,
        );
        // Push snapshot for undo
        setTimeout(() => pushSnapshot(newLayers), 0);
        return newLayers;
      });
    },
    [activeLayerId, pushSnapshot],
  );

  // ── Mouse handlers ────────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!leafletMap || isPanningRef.current || e.button === 1) return;
    if (tool === "pan") return;
    if (!isLayerEditable()) return;

    const ll = getMouseLatLng(e);

    if (tool === "text") {
      const pt = getMouseContainerPt(e);
      setTextInput({
        visible: true,
        x: pt.x,
        y: pt.y,
        latLng: ll,
        value: "",
      });
      return;
    }

    if (tool === "eraser") {
      // Proximity-based: remove strokes near click point
      const activeLayer = getActiveLayer();
      if (!activeLayer) return;

      const threshold = 0.0005 * Math.pow(2, 14 - leafletMap.getZoom());
      const remaining = activeLayer.strokes.filter((stroke) => {
        switch (stroke.type) {
          case "freehand":
            return !stroke.points.some((p) => latLngDist(p, ll) < threshold);
          case "line":
            return (
              latLngDist(stroke.start, ll) >= threshold &&
              latLngDist(stroke.end, ll) >= threshold &&
              pointToSegmentDist(ll, stroke.start, stroke.end) >= threshold
            );
          case "rect":
            return (
              latLngDist(stroke.topLeft, ll) >= threshold &&
              latLngDist(stroke.bottomRight, ll) >= threshold &&
              latLngDist(
                { lat: stroke.topLeft.lat, lng: stroke.bottomRight.lng },
                ll,
              ) >= threshold &&
              latLngDist(
                { lat: stroke.bottomRight.lat, lng: stroke.topLeft.lng },
                ll,
              ) >= threshold
            );
          case "circle":
            return latLngDist(stroke.center, ll) >= threshold;
          case "text":
            return latLngDist(stroke.anchor, ll) >= threshold;
          case "eraser":
            return true;
          default:
            return true;
        }
      });

      if (remaining.length !== activeLayer.strokes.length) {
        const newLayers = layers.map((l) =>
          l.id === activeLayerId ? { ...l, strokes: remaining } : l,
        );
        setLayers(newLayers);
        pushSnapshot(newLayers);
      }
      return;
    }

    isDrawingRef.current = true;
    dragStartRef.current = ll;

    if (tool === "pen") {
      currentStrokeRef.current = [ll];
    } else if (tool === "line" || tool === "rect" || tool === "circle") {
      setPreview({ start: ll, end: ll });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingRef.current || !leafletMap || isPanningRef.current) return;

    const ll = getMouseLatLng(e);

    if (tool === "pen") {
      currentStrokeRef.current.push(ll);
    } else if (tool === "line" || tool === "rect" || tool === "circle") {
      setPreview((prev) => (prev ? { ...prev, end: ll } : null));
    }
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current || !leafletMap) return;
    isDrawingRef.current = false;

    if (tool === "pen") {
      const points = [...currentStrokeRef.current];
      currentStrokeRef.current = [];
      if (points.length < 2) return;
      addStrokeToActiveLayer({
        type: "freehand",
        points,
        color,
        width: strokeWidth,
        opacity,
      });
    } else if (tool === "line" && preview) {
      addStrokeToActiveLayer({
        type: "line",
        start: preview.start,
        end: preview.end,
        color,
        width: strokeWidth,
        opacity,
      });
      setPreview(null);
    } else if (tool === "rect" && preview) {
      addStrokeToActiveLayer({
        type: "rect",
        topLeft: preview.start,
        bottomRight: preview.end,
        color,
        width: strokeWidth,
        opacity,
        filled,
      });
      setPreview(null);
    } else if (tool === "circle" && preview) {
      const radiusLat = Math.abs(preview.end.lat - preview.start.lat);
      const radiusLng = Math.abs(preview.end.lng - preview.start.lng);
      addStrokeToActiveLayer({
        type: "circle",
        center: preview.start,
        radiusLat,
        radiusLng,
        color,
        width: strokeWidth,
        opacity,
        filled,
      });
      setPreview(null);
    }

    dragStartRef.current = null;
  };

  const handleTextSubmit = () => {
    if (textInput.value.trim()) {
      addStrokeToActiveLayer({
        type: "text",
        anchor: textInput.latLng,
        text: textInput.value,
        color,
        fontSize,
        opacity,
      });
    }
    setTextInput({
      visible: false,
      x: 0,
      y: 0,
      latLng: { lat: 0, lng: 0 },
      value: "",
    });
  };

  // ── Layer visibility / lock / opacity ──────────────────────────────────

  const toggleVisibility = (layerId: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    );
  };

  const toggleLock = (layerId: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l)),
    );
  };

  const setLayerOpacity = (layerId: number, val: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, opacity: val } : l)),
    );
  };

  // ── Cursor ─────────────────────────────────────────────────────────────

  const getCursor = (): string => {
    if (isPanning || tool === "pan") return "grab";
    if (!isLayerEditable()) return "not-allowed";
    if (tool === "text") return "text";
    return "crosshair";
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (!visible) return null;

  const activeLayer = getActiveLayer();

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[500] overflow-hidden"
      style={{
        pointerEvents: isPanning || tool === "pan" ? "none" : "auto",
        cursor: getCursor(),
      }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: isPanning || tool === "pan" ? "none" : "auto", cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDrawingRef.current) handleMouseUp();
        }}
      />

      {/* ── Top toolbar ── */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#0f172a]/95 backdrop-blur-sm rounded-xl shadow-2xl px-3 py-2 border border-[#334155] flex-wrap"
        style={{ zIndex: 502 }}
      >
        {/* Tool buttons */}
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === t.id
                ? "bg-[#F6AA1C]/20 border border-[#F6AA1C]/40 text-[#F6AA1C]"
                : "bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-slate-100 hover:border-[#475569]"
            }`}
            title={`${t.label} (${t.shortcut})`}
          >
            {t.label}
          </button>
        ))}

        <div className="w-px h-5 bg-[#334155] mx-0.5" />

        {/* Color */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-7 h-7 rounded-lg cursor-pointer border border-[#334155] bg-[#1e293b] p-0.5"
          title="Color"
        />

        {/* Stroke width */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500">W</span>
          <input
            type="range"
            min={1}
            max={40}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-16 accent-[#F6AA1C]"
          />
          <span className="text-[10px] text-slate-500 w-4 text-right">
            {strokeWidth}
          </span>
        </div>

        {/* Opacity */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500">Op</span>
          <input
            type="range"
            min={5}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-14 accent-[#F6AA1C]"
          />
          <span className="text-[10px] text-slate-500 w-6 text-right">
            {opacity}%
          </span>
        </div>

        {/* Fill toggle (for rect/circle) */}
        {(tool === "rect" || tool === "circle") && (
          <button
            onClick={() => setFilled((f) => !f)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filled
                ? "bg-[#F6AA1C]/20 border border-[#F6AA1C]/40 text-[#F6AA1C]"
                : "bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-slate-100"
            }`}
            title="Toggle fill"
          >
            Fill
          </button>
        )}

        {/* Font size (for text tool) */}
        {tool === "text" && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">Sz</span>
            <input
              type="range"
              min={12}
              max={48}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-14 accent-[#F6AA1C]"
            />
            <span className="text-[10px] text-slate-500 w-4 text-right">
              {fontSize}
            </span>
          </div>
        )}

        <div className="w-px h-5 bg-[#334155] mx-0.5" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="px-2 py-1.5 rounded-lg text-xs bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-slate-100 hover:border-[#475569] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="px-2 py-1.5 rounded-lg text-xs bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-slate-100 hover:border-[#475569] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Redo (Ctrl+Y)"
        >
          Redo
        </button>

        <div className="w-px h-5 bg-[#334155] mx-0.5" />

        {/* Save / Export */}
        <button
          onClick={handleSave}
          disabled={!activeLayerId || saving}
          className="px-2.5 py-1.5 rounded-lg text-xs bg-[#F6AA1C] hover:bg-[#F6AA1C]/80 text-[#0a0f1e] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleExportPng}
          className="px-2.5 py-1.5 rounded-lg text-xs bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-slate-100 hover:border-[#475569] transition-all"
          title="Export all visible layers as PNG"
        >
          Export PNG
        </button>
      </div>

      {/* ── Zoom controls (bottom-left) ── */}
      <div
        className="absolute bottom-4 left-4 flex flex-col gap-1"
        style={{ zIndex: 502 }}
      >
        <button
          onClick={() => leafletMap?.zoomIn(1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0f172a]/95 backdrop-blur-sm border border-[#334155] text-slate-300 hover:text-white hover:border-[#475569] text-lg font-bold transition-all shadow-lg"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => leafletMap?.zoomOut(1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0f172a]/95 backdrop-blur-sm border border-[#334155] text-slate-300 hover:text-white hover:border-[#475569] text-lg font-bold transition-all shadow-lg"
          title="Zoom out"
        >
          −
        </button>
      </div>

      {/* ── Pan hint (bottom center) ── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a]/80 backdrop-blur-sm text-slate-500 px-3 py-1.5 rounded-lg text-[10px] border border-[#334155]"
        style={{ zIndex: 502 }}
      >
        Hold{" "}
        <kbd className="px-1 py-0.5 bg-[#1e293b] rounded text-slate-400 text-[10px]">
          Space
        </kbd>{" "}
        to pan · Scroll to zoom ·{" "}
        <kbd className="px-1 py-0.5 bg-[#1e293b] rounded text-slate-400 text-[10px]">
          ?
        </kbd>{" "}
        shortcuts
      </div>

      {/* ── Keyboard shortcut legend ── */}
      {showLegend && (
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#0f172a]/95 backdrop-blur-sm rounded-xl shadow-2xl border border-[#334155] p-4 text-xs text-slate-300"
          style={{ zIndex: 503 }}
        >
          <div className="font-semibold text-slate-100 mb-2">
            Keyboard Shortcuts
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                V
              </kbd>{" "}
              Pan
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                P
              </kbd>{" "}
              Pen
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                L
              </kbd>{" "}
              Line
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                R
              </kbd>{" "}
              Rectangle
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                C
              </kbd>{" "}
              Circle
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                X
              </kbd>{" "}
              Text
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                E
              </kbd>{" "}
              Eraser
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                Space
              </kbd>{" "}
              Temp pan
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                Ctrl+Z
              </kbd>{" "}
              Undo
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-[#1e293b] rounded text-[#F6AA1C] text-[10px]">
                Ctrl+Y
              </kbd>{" "}
              Redo
            </div>
          </div>
          <button
            onClick={() => setShowLegend(false)}
            className="absolute top-2 right-2 text-slate-500 hover:text-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Layer panel (top-right) ── */}
      <div
        className="absolute top-3 right-3 bg-[#0f172a]/95 backdrop-blur-sm rounded-xl shadow-2xl border border-[#334155] w-64"
        style={{ zIndex: 502 }}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#334155]">
          <button
            onClick={() => setLayersPanelOpen((p) => !p)}
            className="text-xs font-semibold text-slate-300 hover:text-slate-100 flex items-center gap-1.5 transition-colors"
          >
            <span>Layers ({layers.length})</span>
            <span className="text-[10px] text-slate-500">
              {layersPanelOpen ? "▼" : "▶"}
            </span>
          </button>
          <button
            onClick={handleCreateLayer}
            className="px-2 py-1 text-xs bg-[#F6AA1C]/20 text-[#F6AA1C] border border-[#F6AA1C]/30 rounded-lg hover:bg-[#F6AA1C]/30 font-medium transition-all"
          >
            + New
          </button>
        </div>

        {layersPanelOpen && (
          <div className="px-2 py-2 max-h-80 overflow-y-auto flex flex-col gap-1">
            {layers.length === 0 && (
              <div className="text-xs text-slate-500 italic px-2 py-4 text-center">
                No layers yet. Click &quot;+ New&quot; to start.
              </div>
            )}
            {layers.map((layer, idx) => {
              const isActive = layer.id === activeLayerId;
              const isRenaming = renamingLayerId === layer.id;

              return (
                <div key={layer.id} className="flex flex-col gap-0.5">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#F6AA1C]/10 border-2 border-[#F6AA1C]/40"
                        : layer.visible
                          ? "bg-[#1e293b] border border-[#334155] hover:border-[#475569]"
                          : "bg-[#1e293b] border border-[#334155] opacity-40"
                    }`}
                    onClick={() => setActiveLayerId(layer.id)}
                  >
                    {/* Visibility toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(layer.id);
                      }}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#334155] shrink-0 text-slate-400 hover:text-slate-100 transition-colors text-[10px]"
                      title={layer.visible ? "Hide" : "Show"}
                    >
                      {layer.visible ? "👁" : "—"}
                    </button>

                    {/* Lock toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(layer.id);
                      }}
                      className={`w-5 h-5 flex items-center justify-center rounded hover:bg-[#334155] shrink-0 transition-colors text-[10px] ${
                        layer.locked
                          ? "text-red-400"
                          : "text-slate-400 hover:text-slate-100"
                      }`}
                      title={layer.locked ? "Unlock" : "Lock"}
                    >
                      {layer.locked ? "🔒" : "🔓"}
                    </button>

                    {/* Name */}
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() =>
                          handleRenameSubmit(layer.id, renameValue)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleRenameSubmit(layer.id, renameValue);
                          if (e.key === "Escape") setRenamingLayerId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-grow bg-[#0a0f1e] border border-[#F6AA1C]/40 rounded px-1 py-0.5 text-xs text-slate-100 outline-none min-w-0"
                      />
                    ) : (
                      <span
                        className={`truncate flex-grow ${
                          isActive
                            ? "font-semibold text-[#F6AA1C]"
                            : "text-slate-300"
                        }`}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setRenamingLayerId(layer.id);
                          setRenameValue(layer.layer_name);
                        }}
                        title="Double-click to rename"
                      >
                        {layer.layer_name}
                      </span>
                    )}

                    {/* Reorder + Delete */}
                    <div className="flex gap-0.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveLayer(layer.id, "up");
                        }}
                        disabled={idx === 0}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#334155] text-slate-400 hover:text-slate-100 disabled:opacity-25 text-[10px] transition-colors"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveLayer(layer.id, "down");
                        }}
                        disabled={idx === layers.length - 1}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#334155] text-slate-400 hover:text-slate-100 disabled:opacity-25 text-[10px] transition-colors"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(layer.id);
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-[10px] transition-colors"
                        title="Delete layer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Layer opacity slider (shown when active) */}
                  {isActive && (
                    <div className="flex items-center gap-1.5 px-2 pb-1">
                      <span className="text-[10px] text-slate-500">
                        Opacity
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={layer.opacity}
                        onChange={(e) =>
                          setLayerOpacity(layer.id, Number(e.target.value))
                        }
                        className="flex-1 accent-[#F6AA1C]"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-[10px] text-slate-500 w-6 text-right">
                        {layer.opacity}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* No active layer hint */}
      {!activeLayerId && layers.length > 0 && (
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#F6AA1C]/10 text-[#F6AA1C] px-4 py-2 rounded-xl shadow-lg text-xs font-medium border border-[#F6AA1C]/30"
          style={{ zIndex: 502 }}
        >
          Select a layer to start drawing
        </div>
      )}

      {/* Locked layer warning */}
      {activeLayer && activeLayer.locked && (
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl shadow-lg text-xs font-medium border border-red-500/30"
          style={{ zIndex: 502 }}
        >
          Layer is locked — unlock to edit
        </div>
      )}

      {/* Text input overlay */}
      {textInput.visible && (
        <input
          autoFocus
          type="text"
          value={textInput.value}
          onChange={(e) =>
            setTextInput((prev) => ({ ...prev, value: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTextSubmit();
            if (e.key === "Escape")
              setTextInput({
                visible: false,
                x: 0,
                y: 0,
                latLng: { lat: 0, lng: 0 },
                value: "",
              });
          }}
          onBlur={handleTextSubmit}
          style={{
            left: textInput.x,
            top: textInput.y - fontSize - 4,
            fontSize,
            zIndex: 503,
          }}
          className="absolute bg-[#0f172a]/95 border-2 border-[#F6AA1C]/60 rounded-lg px-2 py-0.5 text-slate-100 outline-none min-w-[120px] placeholder:text-slate-500"
          placeholder="Type and press Enter..."
        />
      )}
    </div>
  );
}

// ── Geometry helper ─────────────────────────────────────────────────────────

function pointToSegmentDist(p: LatLng, a: LatLng, b: LatLng): number {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  if (dx === 0 && dy === 0) return latLngDist(p, a);
  let t = ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return latLngDist(p, { lat: a.lat + t * dy, lng: a.lng + t * dx });
}
