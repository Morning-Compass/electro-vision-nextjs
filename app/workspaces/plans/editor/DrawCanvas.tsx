"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import toast from "react-hot-toast";

type Point = { x: number; y: number };

type FreehandElement = {
  type: "freehand";
  points: Point[];
  color: string;
  width: number;
};

type TextElement = {
  type: "text";
  text: string;
  position: Point;
  color: string;
  fontSize: number;
};

type EraserElement = {
  type: "eraser";
  points: Point[];
  width: number;
};

type DrawElement = FreehandElement | TextElement | EraserElement;

type Tool = "pen" | "text" | "eraser";

export interface LayerData {
  id: number;
  layer_name: string;
  layer_order: number;
  has_image: boolean;
  visible: boolean;
  blobUrl?: string;
}

interface DrawCanvasProps {
  visible: boolean;
  workspaceId: number;
  token: string;
  userId: number;
  leafletMap?: any;
}

const TOOLS: { id: Tool; label: string }[] = [
  { id: "pen", label: "Pen" },
  { id: "text", label: "Text" },
  { id: "eraser", label: "Eraser" },
];

export default function DrawCanvas({
  visible,
  workspaceId,
  token,
  userId,
  leafletMap,
}: DrawCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingLayerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<DrawElement[]>([]);
  const currentPointsRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  // Transform tracking — kept as refs so event handlers always see latest values
  const transformRef = useRef({ scale: 1, ox: 0, oy: 0 });
  const baseZoomRef = useRef<number>(0);
  const basePixelOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const textDrawPosRef = useRef<Point>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(20);
  const [history, setHistory] = useState<DrawElement[]>([]);
  const [drawTransform, setDrawTransform] = useState("");

  const [layers, setLayers] = useState<LayerData[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<number | null>(null);
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);
  const [renamingLayerId, setRenamingLayerId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [saving, setSaving] = useState(false);

  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number; // screen coords relative to container
    y: number;
    value: string;
  }>({ visible: false, x: 0, y: 0, value: "" });

  const wsId = workspaceId.toString();

  // ── drawing primitives ──────────────────────────────────

  const drawFreehand = (ctx: CanvasRenderingContext2D, el: FreehandElement) => {
    if (el.points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++)
      ctx.lineTo(el.points[i].x, el.points[i].y);
    ctx.stroke();
    ctx.restore();
  };

  const drawEraser = (ctx: CanvasRenderingContext2D, el: EraserElement) => {
    if (el.points.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = el.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++)
      ctx.lineTo(el.points[i].x, el.points[i].y);
    ctx.stroke();
    ctx.restore();
  };

  const drawText = (ctx: CanvasRenderingContext2D, el: TextElement) => {
    ctx.save();
    ctx.fillStyle = el.color;
    ctx.font = `bold ${el.fontSize}px sans-serif`;
    ctx.fillText(el.text, el.position.x, el.position.y);
    ctx.restore();
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    if (baseImageRef.current) {
      ctx.drawImage(baseImageRef.current, 0, 0, w, h);
    }

    for (const el of historyRef.current) {
      if (el.type === "freehand") drawFreehand(ctx, el);
      else if (el.type === "eraser") drawEraser(ctx, el);
      else if (el.type === "text") drawText(ctx, el);
    }
  }, []);

  // ── canvas sizing (observes the outer container, not the drawing layer) ──

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
      if (ctx) ctx.scale(dpr, dpr);
      redraw();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => observer.disconnect();
  }, [visible, redraw]);

  useEffect(() => {
    historyRef.current = history;
    redraw();
  }, [history, redraw]);

  // ── zoom sync with Leaflet map ──────────────────────────

  useEffect(() => {
    if (!leafletMap || !visible) {
      setDrawTransform("");
      transformRef.current = { scale: 1, ox: 0, oy: 0 };
      return;
    }

    // Capture base state when draw mode activates (or map becomes available)
    baseZoomRef.current = leafletMap.getZoom();
    const origin = leafletMap.getPixelOrigin();
    basePixelOriginRef.current = { x: origin.x, y: origin.y };
    setDrawTransform("");
    transformRef.current = { scale: 1, ox: 0, oy: 0 };

    const updateTransform = () => {
      const zoom = leafletMap.getZoom();
      // scale factor relative to when we started
      const scale = leafletMap.getZoomScale(zoom, baseZoomRef.current);
      const newOrigin = leafletMap.getPixelOrigin();
      // Standard Leaflet overlay positioning formula (same as L.Renderer._update)
      const ox = basePixelOriginRef.current.x * scale - newOrigin.x;
      const oy = basePixelOriginRef.current.y * scale - newOrigin.y;
      transformRef.current = { scale, ox, oy };
      setDrawTransform(`translate(${ox}px,${oy}px) scale(${scale})`);
    };

    leafletMap.on("zoom move zoomend moveend", updateTransform);
    return () => {
      leafletMap.off("zoom move zoomend moveend", updateTransform);
      setDrawTransform("");
      transformRef.current = { scale: 1, ox: 0, oy: 0 };
    };
  }, [leafletMap, visible]);

  // ── forward scroll wheel events to the Leaflet map ─────

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !visible || !leafletMap) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        leafletMap.zoomIn(1);
      } else {
        leafletMap.zoomOut(1);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [leafletMap, visible]);

  // ── Space bar hold to pan ─────────────────────────────

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
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
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

  // ── Middle mouse button to pan ────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !visible || !leafletMap) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 1) return; // middle button only
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

  // ── API: fetch all layers ───────────────────────────────

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

      const layersWithBlobs: LayerData[] = await Promise.all(
        serverLayers.map(async (l) => {
          let blobUrl: string | undefined;
          if (l.has_image) {
            try {
              const response = await fetch(
                ApiLinks.drawingLayers.getImage(wsId, l.id.toString()),
                { headers: { Authorization: `Bearer ${token}` } },
              );
              if (response.ok) {
                const blob = await response.blob();
                blobUrl = URL.createObjectURL(blob);
              }
            } catch {
              /* skip */
            }
          }
          return {
            id: l.id,
            layer_name: l.layer_name,
            layer_order: l.layer_order,
            has_image: l.has_image,
            visible: true,
            blobUrl,
          };
        }),
      );

      setLayers(layersWithBlobs);
    } catch (error) {
      console.error("Error fetching drawing layers:", error);
    }
  }, [wsId, token]);

  useEffect(() => {
    if (visible) fetchLayers();
  }, [visible, fetchLayers]);

  // ── API: create layer ───────────────────────────────────

  const handleCreateLayer = async () => {
    try {
      const res = await OLF.post(
        ApiLinks.drawingLayers.create(wsId),
        { user_id: userId, layer_name: `Layer ${layers.length + 1}` },
        undefined,
        token,
      );
      if (res) {
        const newLayer: LayerData = {
          id: res.id,
          layer_name: res.layer_name,
          layer_order: res.layer_order,
          has_image: false,
          visible: true,
        };
        setLayers((prev) => [...prev, newLayer]);
        handleSelectLayer(res.id, false);
      }
    } catch (error) {
      console.error("Error creating layer:", error);
      toast.error("Failed to create layer");
    }
  };

  // ── API: rename layer ───────────────────────────────────

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

  // ── API: delete layer ───────────────────────────────────

  const handleDeleteLayer = async (layerId: number) => {
    const layerToDelete = layers.find((l) => l.id === layerId);
    try {
      await OLF.delete(
        ApiLinks.drawingLayers.delete(wsId, layerId.toString()),
        undefined,
        undefined,
        token,
      );
      if (layerToDelete?.blobUrl) URL.revokeObjectURL(layerToDelete.blobUrl);
      setLayers((prev) => prev.filter((l) => l.id !== layerId));
      if (activeLayerId === layerId) {
        setActiveLayerId(null);
        baseImageRef.current = null;
        setHistory([]);
        redraw();
      }
      toast.success("Layer deleted");
    } catch (error) {
      console.error("Error deleting layer:", error);
      toast.error("Failed to delete layer");
    }
  };

  // ── API: reorder layers ─────────────────────────────────

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

  // ── Select & load a layer into the canvas ───────────────

  const handleSelectLayer = async (
    layerId: number,
    hasImage: boolean | undefined = undefined,
  ) => {
    if (layerId === activeLayerId) return;
    setActiveLayerId(layerId);
    setHistory([]);
    baseImageRef.current = null;

    const layer = layers.find((l) => l.id === layerId);
    const shouldLoad =
      hasImage !== undefined ? hasImage : layer?.has_image ?? false;

    if (shouldLoad) {
      try {
        const response = await fetch(
          ApiLinks.drawingLayers.getImage(wsId, layerId.toString()),
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const img = new window.Image();
          img.onload = () => {
            baseImageRef.current = img;
            redraw();
          };
          img.src = url;
        }
      } catch (error) {
        console.error("Error loading layer image:", error);
      }
    } else {
      redraw();
    }
  };

  // ── API: save active layer ──────────────────────────────

  const handleSave = async () => {
    if (!activeLayerId) {
      toast.error("Select a layer first");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    canvas.toBlob(
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

          const newBlobUrl = URL.createObjectURL(blob);
          setLayers((prev) =>
            prev.map((l) => {
              if (l.id === activeLayerId) {
                if (l.blobUrl) URL.revokeObjectURL(l.blobUrl);
                return { ...l, has_image: true, blobUrl: newBlobUrl };
              }
              return l;
            }),
          );

          const img = new window.Image();
          img.onload = () => {
            baseImageRef.current = img;
            setHistory([]);
          };
          img.src = newBlobUrl;

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

  // ── coordinate helpers ──────────────────────────────────

  /**
   * Returns a point in CANVAS coordinate space (pre-transform),
   * accounting for the current CSS scale of the drawing layer.
   */
  const getCanvasPoint = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = transformRef.current.scale;
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  /**
   * Returns a point in CONTAINER coordinate space (unaffected by transform),
   * used to position absolutely-placed UI overlays (e.g. text input).
   */
  const getContainerPoint = (e: React.MouseEvent): Point => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // ── mouse handlers ──────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeLayerId || isPanningRef.current || e.button === 1) return;
    if (tool === "text") {
      const screenPt = getContainerPoint(e);
      const canvasPt = getCanvasPoint(e);
      textDrawPosRef.current = canvasPt;
      setTextInput({ visible: true, x: screenPt.x, y: screenPt.y, value: "" });
      return;
    }
    isDrawingRef.current = true;
    currentPointsRef.current = [getCanvasPoint(e)];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingRef.current || isPanningRef.current) return;
    const point = getCanvasPoint(e);
    currentPointsRef.current.push(point);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = currentPointsRef.current;
    if (points.length < 2) return;
    const prev = points[points.length - 2];
    const curr = points[points.length - 1];

    ctx.save();
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();
    ctx.restore();
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const points = [...currentPointsRef.current];
    currentPointsRef.current = [];
    if (points.length < 2) return;

    if (tool === "eraser") {
      setHistory((prev) => [
        ...prev,
        { type: "eraser", points, width: strokeWidth },
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        { type: "freehand", points, color, width: strokeWidth },
      ]);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.value.trim()) {
      setHistory((prev) => [
        ...prev,
        {
          type: "text",
          text: textInput.value,
          position: textDrawPosRef.current, // canvas-space coords
          color,
          fontSize,
        },
      ]);
    }
    setTextInput({ visible: false, x: 0, y: 0, value: "" });
  };

  const toggleVisibility = (layerId: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    );
  };

  if (!visible) return null;

  const activeLayer = layers.find((l) => l.id === activeLayerId);
  const activeLayerVisible = activeLayer?.visible ?? true;
  const scale = transformRef.current.scale;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[500] overflow-hidden"
      style={{
        pointerEvents: isPanning ? "none" : "auto",
        cursor: isPanning ? "grab" : undefined,
      }}
    >

      {/* ── Drawing layer — zooms with the Leaflet map ──── */}
      <div
        ref={drawingLayerRef}
        className="absolute inset-0"
        style={{
          transform: drawTransform || undefined,
          transformOrigin: "0 0",
        }}
      >
        {/* Background layers (visible, not active) */}
        {layers
          .filter((l) => l.visible && l.blobUrl && l.id !== activeLayerId)
          .map((layer) => (
            <img
              key={layer.id}
              src={layer.blobUrl}
              alt={layer.layer_name}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          ))}

        {/* Active drawing canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 ${
            !activeLayerId || !activeLayerVisible
              ? "cursor-not-allowed"
              : tool === "text"
                ? "cursor-text"
                : "cursor-crosshair"
          }`}
          style={{
            opacity: activeLayerVisible ? 1 : 0,
            pointerEvents: activeLayerVisible ? "auto" : "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* ── Top toolbar (stays fixed, outside drawing layer) ── */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0f172a]/95 backdrop-blur-sm rounded-xl shadow-2xl px-4 py-2.5 border border-[#334155]"
        style={{ zIndex: 502 }}
      >
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === t.id
                ? "bg-[#F6AA1C]/20 border border-[#F6AA1C]/40 text-[#F6AA1C]"
                : "bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-slate-100 hover:border-[#475569]"
            }`}
          >
            {t.label}
          </button>
        ))}

        <div className="w-px h-5 bg-[#334155] mx-0.5" />

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-7 h-7 rounded-lg cursor-pointer border border-[#334155] bg-[#1e293b] p-0.5"
          title="Pick color"
        />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {tool === "eraser" ? "Eraser" : "Brush"}
          </span>
          <input
            type="range"
            min={1}
            max={tool === "eraser" ? 40 : 20}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20 accent-[#F6AA1C]"
          />
          <span className="text-xs text-slate-500 w-4 text-right">
            {strokeWidth}
          </span>
        </div>

        {tool === "text" && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Font</span>
            <input
              type="range"
              min={12}
              max={48}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-16 accent-[#F6AA1C]"
            />
            <span className="text-xs text-slate-500 w-4 text-right">
              {fontSize}
            </span>
          </div>
        )}

        <div className="w-px h-5 bg-[#334155] mx-0.5" />

        <button
          onClick={() => setHistory((prev) => prev.slice(0, -1))}
          disabled={history.length === 0}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-slate-100 hover:border-[#475569] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Undo
        </button>
        <button
          onClick={() => {
            setHistory([]);
            baseImageRef.current = null;
            redraw();
          }}
          disabled={history.length === 0 && !baseImageRef.current}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-red-400 hover:border-red-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          disabled={!activeLayerId || saving}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#F6AA1C] hover:bg-[#F6AA1C]/80 text-[#0a0f1e] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {saving ? "Saving..." : "Save Layer"}
        </button>
      </div>

      {/* ── Zoom controls (stays fixed, bottom-left) ────── */}
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

      {/* ── Pan hint (bottom center) ─────────────────────── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a]/80 backdrop-blur-sm text-slate-500 px-3 py-1.5 rounded-lg text-[10px] border border-[#334155]"
        style={{ zIndex: 502 }}
      >
        Hold <kbd className="px-1 py-0.5 bg-[#1e293b] rounded text-slate-400 text-[10px]">Space</kbd> to pan · Scroll to zoom
      </div>

      {/* ── Layer panel (stays fixed) ────────────────────── */}
      <div
        className="absolute top-3 right-3 bg-[#0f172a]/95 backdrop-blur-sm rounded-xl shadow-2xl border border-[#334155] w-60"
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
          <div className="px-2 py-2 max-h-64 overflow-y-auto flex flex-col gap-1">
            {layers.length === 0 && (
              <div className="text-xs text-slate-500 italic px-2 py-4 text-center">
                No layers yet. Click &quot;+ New&quot; to start.
              </div>
            )}
            {layers.map((layer, idx) => {
              const isActive = layer.id === activeLayerId;
              const isRenaming = renamingLayerId === layer.id;

              return (
                <div
                  key={layer.id}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#F6AA1C]/10 border-2 border-[#F6AA1C]/40"
                      : layer.visible
                        ? "bg-[#1e293b] border border-[#334155] hover:border-[#475569]"
                        : "bg-[#1e293b] border border-[#334155] opacity-40"
                  }`}
                  onClick={() => handleSelectLayer(layer.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(layer.id);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#334155] shrink-0 text-slate-400 hover:text-slate-100 transition-colors"
                    title={layer.visible ? "Hide" : "Show"}
                  >
                    {layer.visible ? "👁" : "—"}
                  </button>

                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(layer.id, renameValue)}
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
              );
            })}
          </div>
        )}
      </div>

      {/* No active layer hint */}
      {!activeLayerId && layers.length > 0 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#F6AA1C]/10 text-[#F6AA1C] px-4 py-2 rounded-xl shadow-lg text-xs font-medium border border-[#F6AA1C]/30"
          style={{ zIndex: 502 }}
        >
          Select a layer to start drawing
        </div>
      )}

      {/* Text input overlay — positioned in container space, not drawing layer space */}
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
              setTextInput({ visible: false, x: 0, y: 0, value: "" });
          }}
          onBlur={handleTextSubmit}
          style={{
            left: textInput.x,
            top: textInput.y - fontSize * scale - 4,
            fontSize: fontSize * scale,
            zIndex: 503,
          }}
          className="absolute bg-[#0f172a]/95 border-2 border-[#F6AA1C]/60 rounded-lg px-2 py-0.5 text-slate-100 outline-none min-w-[120px] placeholder:text-slate-500"
          placeholder="Type and press Enter..."
        />
      )}
    </div>
  );
}
