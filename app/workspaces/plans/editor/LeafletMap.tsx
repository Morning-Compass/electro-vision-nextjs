import { useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import Image from 'next/image';

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

// Fix for the default marker icons in Next.js
const fixLeafletIcons = () => {
  // Only run on client side
  if (typeof window === 'undefined') return;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  });
};

// Component to handle drag and drop on the map
function DragDropHandler({ onTaskDrop }: { onTaskDrop: (nodeType: string, position: [number, number]) => void }) {
  // Use useMapEvents to register map event handlers
  const map = useMapEvents({
    dragover: (e) => {
      // Prevent default to enable drop
      e.originalEvent.preventDefault();
    },
    drop: (e) => {
      try {
        // Get the node type from dataTransfer
        const nodeType = e.originalEvent.dataTransfer?.getData('application/nodeType');
        if (nodeType) {
          // Convert mouse event to map coordinates
          const latlng = map.mouseEventToLatLng(e.originalEvent);
          // Call the drop handler with the node type and position
          onTaskDrop(nodeType, [latlng.lat, latlng.lng]);
          // Prevent default browser handling
          e.originalEvent.preventDefault();
        }
      } catch (error) {
        console.error('Error handling map drop event:', error);
      }
    }
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
  onTaskDragEnd 
}: LeafletMapProps) {
  // Fix default icons first
  useEffect(() => {
    fixLeafletIcons();
  }, []);
  
  // Create icons - define them outside useEffect to avoid null refs during render
  const defaultTaskIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new L.Icon({
      iconUrl: '/outlet.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16], 
      popupAnchor: [0, -16],
    });
  }, []);
  
  const customTaskIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new L.Icon({
      iconUrl: '/problem.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, []);
  
  return (
    <>
      {typeof window !== 'undefined' && (
        <MapContainer 
          center={[51.505, -0.09]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.7}
      />
      
      <ZoomControl position="bottomleft" />
      
      <DragDropHandler onTaskDrop={onTaskDrop} />
      
      {/* Task markers */}
      {tasks.map(task => (
        <Marker 
          key={task.id}
          position={task.position}
          draggable={true}
          icon={task.type === 'defaultTask' ? (defaultTaskIcon || new L.Icon.Default()) : (customTaskIcon || new L.Icon.Default())}
          eventHandlers={{
            click: () => onTaskSelect(task.id),
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onTaskDragEnd(task.id, [position.lat, position.lng]);
            }
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
      {connections.map(connection => {
        const sourceTask = tasks.find(t => t.id === connection.source);
        const targetTask = tasks.find(t => t.id === connection.target);
        
        if (!sourceTask || !targetTask) return null;
        
        return (
          <Polyline 
            key={connection.id}
            positions={[sourceTask.position, targetTask.position]}
            pathOptions={{ 
              color: 'blue', 
              weight: 3,
              dashArray: connection.animated ? '10, 10' : undefined
            }}
          />
        );
      })}
        </MapContainer>
      )}
    </>
  );
}