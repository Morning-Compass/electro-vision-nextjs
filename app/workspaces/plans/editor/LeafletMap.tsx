import { useEffect, useMemo } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define the types for our props
interface TaskNodeData {
  id: string;
  label: string;
  description?: string;
  image?: string | null;
  position: [number, number];
  type: string;
}

interface TaskConnection {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

interface LeafletMapProps {
  tasks: TaskNodeData[];
  connections: TaskConnection[];
  selectedTaskId: string | null;
  onTaskSelect: (id: string) => void;
  onTaskDrop: (nodeType: string, position: [number, number]) => void;
  onTaskDragEnd: (id: string, position: [number, number]) => void;
}

// Component to handle map events including drag and drop
function MapEventHandler({
  onTaskDrop,
}: {
  onTaskDrop: LeafletMapProps["onTaskDrop"];
}) {
  const map = useMapEvents({
    dragover: (e) => {
      e.originalEvent.preventDefault();
    },
    drop: (e) => {
      const nodeType = e.originalEvent.dataTransfer?.getData(
        "application/nodeType",
      );
      if (nodeType) {
        const latlng = map.mouseEventToLatLng(e.originalEvent);
        onTaskDrop(nodeType, [latlng.lat, latlng.lng]);
        e.originalEvent.preventDefault();
      }
    },
  });

  return null;
}

// Main Map Component
export default function LeafletMap({
  tasks,
  connections,
  selectedTaskId,
  onTaskSelect,
  onTaskDrop,
  onTaskDragEnd,
}: LeafletMapProps) {
  // Fix default icons
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Fix the default icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    });
  }, []);

  // Create custom icons for different task types
  const defaultTaskIcon = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new L.Icon({
      iconUrl: "/outlet.png",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, []);

  const customTaskIcon = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new L.Icon({
      iconUrl: "/problem.png",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, []);

  // Calculate bounds for the image background
  const bounds: L.LatLngBoundsExpression = [
    [51.3, -0.3], // Southwest corner
    [51.7, 0.1], // Northeast corner
  ];

  // Only render on client side
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <MapContainer
      center={[51.5, -0.1]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      maxBounds={[
        [51.2, -0.4],
        [51.8, 0.2],
      ]}
      minZoom={11}
    >
      {/* Custom background image */}
      <ImageOverlay url="/problem.png" bounds={bounds} opacity={0.8} />

      <ZoomControl position="bottomleft" />

      {/* Map event handler for drag and drop */}
      <MapEventHandler onTaskDrop={onTaskDrop} />

      {/* Task markers */}
      {tasks.map((task) => (
        <Marker
          key={task.id}
          position={task.position}
          draggable={true}
          icon={
            task.type === "defaultTask"
              ? defaultTaskIcon || new L.Icon.Default()
              : customTaskIcon || new L.Icon.Default()
          }
          eventHandlers={{
            click: () => onTaskSelect(task.id),
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onTaskDragEnd(task.id, [position.lat, position.lng]);
            },
          }}
        >
          <Popup>
            <div>
              <strong>{task.label}</strong>
              {task.description && <p>{task.description}</p>}
              {task.image && (
                <div className="mt-2">
                  <img
                    src={task.image}
                    alt={task.label}
                    width={100}
                    height={100}
                    className="rounded object-cover"
                  />
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Connections between tasks */}
      {connections.map((connection) => {
        const sourceTask = tasks.find((t) => t.id === connection.source);
        const targetTask = tasks.find((t) => t.id === connection.target);

        if (!sourceTask || !targetTask) return null;

        return (
          <Polyline
            key={connection.id}
            positions={[sourceTask.position, targetTask.position]}
            pathOptions={{
              color: "blue",
              weight: 3,
              dashArray: connection.animated ? "10, 10" : undefined,
            }}
          />
        );
      })}
    </MapContainer>
  );
}
