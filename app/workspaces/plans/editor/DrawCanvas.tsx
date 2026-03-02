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
}: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<DrawElement[]>([]);
  const currentPointsRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(20);
  const [history, setHistory] = useState<DrawElement[]>([]);

  const [layers, setLayers] = useState<LayerData[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<number | null>(null);
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);
  const [renamingLayerId, setRenamingLayerId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [saving, setSaving] = useState(false);

  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number;
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

  // ── canvas sizing ───────────────────────────────────────

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

  // ── mouse handlers ──────────────────────────────────────

  const getCanvasPoint = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeLayerId) return;
    if (tool === "text") {
      const point = getCanvasPoint(e);
      setTextInput({ visible: true, x: point.x, y: point.y, value: "" });
      return;
    }
    isDrawingRef.current = true;
    currentPointsRef.current = [getCanvasPoint(e)];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
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
          position: { x: textInput.x, y: textInput.y },
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

  return (
    <div ref={containerRef} className="absolute inset-0 z-[500]">
      {/* Background layers (visible, not active) */}
      {layers
        .filter((l) => l.visible && l.blobUrl && l.id !== activeLayerId)
        .map((layer) => (
          <img
            key={layer.id}
            src={layer.blobUrl}
            alt={layer.layer_name}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ zIndex: 500 }}
          />
        ))}

      {/* Active drawing canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${!activeLayerId || !activeLayerVisible
          ? "cursor-not-allowed"
          : tool === "text"
            ? "cursor-text"
            : "cursor-crosshair"
          }`}
        style={{
          zIndex: 501,
          opacity: activeLayerVisible ? 1 : 0,
          pointerEvents: activeLayerVisible ? "auto" : "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* ── Top toolbar ─────────────────────────────────── */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2.5 border border-gray-200"
        style={{ zIndex: 502 }}
      >
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${tool === t.id
              ? "bg-blue-500 text-white shadow-sm"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
          >
            {t.label}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
          title="Pick color"
        />

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {tool === "eraser" ? "Eraser" : "Brush"}
          </span>
          <input
            type="range"
            min={1}
            max={tool === "eraser" ? 40 : 20}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20 accent-blue-500"
          />
          <span className="text-xs text-gray-500 w-5 text-right">
            {strokeWidth}
          </span>
        </div>

        {tool === "text" && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Font</span>
            <input
              type="range"
              min={12}
              max={48}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-16 accent-blue-500"
            />
            <span className="text-xs text-gray-500 w-5 text-right">
              {fontSize}
            </span>
          </div>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => setHistory((prev) => prev.slice(0, -1))}
          disabled={history.length === 0}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          disabled={!activeLayerId || saving}
          className="px-3 py-1.5 rounded-lg text-sm bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Layer"}
        </button>
      </div>

      {/* ── Layer panel ─────────────────────────────────── */}
      <div
        className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 w-60"
        style={{ zIndex: 502 }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <button
            onClick={() => setLayersPanelOpen((p) => !p)}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1"
          >
            <span>Layers ({layers.length})</span>
            <span className="text-xs">{layersPanelOpen ? "▼" : "▶"}</span>
          </button>
          <button
            onClick={handleCreateLayer}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
          >
            + New
          </button>
        </div>

        {layersPanelOpen && (
          <div className="px-2 py-2 max-h-64 overflow-y-auto flex flex-col gap-1">
            {layers.length === 0 && (
              <div className="text-xs text-gray-400 italic px-2 py-3 text-center">
                No layers yet. Click &quot;+ New&quot; to start.
              </div>
            )}
            {layers.map((layer, idx) => {
              const isActive = layer.id === activeLayerId;
              const isRenaming = renamingLayerId === layer.id;

              return (
                <div
                  key={layer.id}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition cursor-pointer ${isActive
                    ? "bg-blue-100 border-2 border-blue-400"
                    : layer.visible
                      ? "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      : "bg-gray-50 border border-gray-200 opacity-50"
                    }`}
                  onClick={() => handleSelectLayer(layer.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(layer.id);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 shrink-0"
                    title={layer.visible ? "Hide" : "Show"}
                  >
                    {layer.visible ? "👁" : "—"}
                  </button>

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
                      className="flex-grow bg-white border border-blue-300 rounded px-1 py-0.5 text-xs outline-none min-w-0"
                    />
                  ) : (
                    <span
                      className={`truncate flex-grow ${isActive ? "font-semibold text-blue-700" : ""}`}
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
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30 text-[10px]"
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
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30 text-[10px]"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLayer(layer.id);
                      }}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 hover:text-red-600 text-[10px]"
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
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-md text-sm font-medium border border-yellow-300"
          style={{ zIndex: 502 }}
        >
          Select a layer to start drawing
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
              setTextInput({ visible: false, x: 0, y: 0, value: "" });
          }}
          onBlur={handleTextSubmit}
          style={{
            left: textInput.x,
            top: textInput.y - fontSize - 4,
            fontSize,
            zIndex: 503,
          }}
          className="absolute bg-white/90 border-2 border-blue-400 rounded px-2 py-0.5 outline-none min-w-[120px]"
          placeholder="Type and press Enter..."
        />
      )}
    </div>
  );
}
