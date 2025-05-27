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
import { root } from "postcss";
import useUserContext from "@/ev-contexts/userContextProvider";

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
  onTaskDrop: (
    nodeType: string,
    position: [number, number],
    taskId?: string,
  ) => void;
  onTaskDragEnd: (id: string, position: [number, number]) => void;
  setMapInstance?: (map: any) => void;
}

// Component to handle map events including drag and drop
function MapEventHandler({
  onTaskDrop,
  setMapInstance,
}: {
  onTaskDrop: LeafletMapProps["onTaskDrop"];
  setMapInstance?: (map: any) => void;
}) {
  const map = useMapEvents({
    dragover: (e) => {
      e.originalEvent.preventDefault();
      // Add a visual cue that this is a droppable area
      if (e.originalEvent.dataTransfer) {
        e.originalEvent.dataTransfer.dropEffect = "copy";
      }
    },
    dragenter: (e) => {
      e.originalEvent.preventDefault();
    },
    drop: (e) => {
      e.originalEvent.preventDefault();

      // Get data from dataTransfer
      const dataTransfer = e.originalEvent.dataTransfer;
      if (!dataTransfer) return;

      // Get the mouse position on the map
      const latlng = map.mouseEventToLatLng(e.originalEvent);
      const position: [number, number] = [latlng.lat, latlng.lng];

      // Get taskId or nodeType directly using the specific data formats
      const taskId = dataTransfer.getData("application/taskId");
      const nodeType = !taskId && dataTransfer.getData("application/nodeType");

      // Execute the appropriate drop action
      if (taskId) {
        onTaskDrop("customTask", position, taskId);
      } else if (nodeType) {
        onTaskDrop(nodeType, position);
      }
    },
  });

  // Make the map instance available to the parent component
  useEffect(() => {
    if (setMapInstance && map) {
      setMapInstance(map);
    }
  }, [map, setMapInstance]);

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
  setMapInstance,
}: LeafletMapProps) {
  const { User } = useUserContext();

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

  console.log(tasks);

  return (
    <MapContainer
      className="h-full w-full z-0"
      style={{ backgroundColor: `var(--color-main-bg)` }}
      center={[51.5, -0.1]}
      zoom={11}
      zoomControl={false}
      maxBounds={[
        [51.2, -0.4],
        [51.8, 0.2],
      ]}
      minZoom={10}
      maxZoom={18}
    >
      {/* Custom background image */}
      <ImageOverlay
        url={User.workspaceData?.currentWorkspace?.coverPhoto || "/problem.png"}
        bounds={bounds}
        opacity={0.8}
      />

      <ZoomControl position="bottomleft" />

      {/* Map event handler for drag and drop */}
      <MapEventHandler
        onTaskDrop={onTaskDrop}
        setMapInstance={setMapInstance}
      />

      {/* Map is a drop target */}

      {/* Task markers */}
      {tasks.map((task) => (
        <Marker
          key={task.id}
          position={task.position}
          draggable={true}
          icon={
            task.image
              ? new L.Icon({
                  iconUrl: task.image,
                  iconSize: [40, 40],
                  iconAnchor: [12, 41],
                })
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
