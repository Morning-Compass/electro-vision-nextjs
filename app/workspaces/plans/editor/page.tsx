"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import Image from "next/image";
import SearchButton from "@/components/SearchButton";
import Input from "@/components/Input";
import Overlay from "@/components/Overlay";
import useUserContext from "@/ev-contexts/userContextProvider";
import "leaflet/dist/leaflet.css";

// Define types for our data structures
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

// Dynamically import the Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
      Loading map editor...
    </div>
  ),
});

// Helper function to handle drop events directly
function handleDirectDrop(
  event: DragEvent,
  onDrop: (
    nodeType: string,
    position: [number, number],
    taskId?: string,
  ) => void,
  map: any,
) {
  event.preventDefault();
  event.stopPropagation();

  // Get mouse position on the map
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Approximate coordinates (will use center if map isn't available)
  let position: [number, number] = [51.5, -0.1];

  if (map && map.containerPointToLatLng) {
    const point = map.containerPointToLatLng([x, y]);
    position = [point.lat, point.lng];
  }

  // Get data from dataTransfer
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return;

  // Extract task ID or node type
  const taskId = dataTransfer.getData("application/taskId");
  const nodeType = !taskId && dataTransfer.getData("application/nodeType");

  // Handle the drop based on data type
  if (taskId) {
    // Visual feedback
    const feedback = document.createElement("div");
    feedback.className =
      "absolute z-[2000] bg-green-500 text-white px-2 py-1 rounded";
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.textContent = "Added!";
    (event.target as HTMLElement).appendChild(feedback);
    setTimeout(() => feedback.remove(), 800);

    onDrop("customTask", position, taskId);
  } else if (nodeType) {
    onDrop(nodeType, position);
  }
}

// Initial data
const initialTasks: TaskNodeData[] = [
  {
    id: "1",
    type: "defaultTask",
    label: "Task 1 - Drag Me!",
    position: [51.45, -0.15],
  },
  {
    id: "2",
    type: "customTask",
    label: "Task 2",
    position: [51.55, -0.05],
  },
];

const initialConnections: TaskConnection[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
];

// Main editor component
function MapEditor() {
  // Removed User context reference as it's not needed for this component

  // Refs for direct DOM access
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);

  // State management
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskNodeData[]>(initialTasks);
  const [connections, setConnections] =
    useState<TaskConnection[]>(initialConnections);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<TaskNodeData[]>([]);

  // New task form state
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPhoto, setNewTaskPhoto] = useState<File | string | null>(null);

  // Track state changes for debugging
  useEffect(() => {
    if (availableTasks.length) {
      console.log(`Available tasks: ${availableTasks.length}`);
    }
  }, [availableTasks]);

  useEffect(() => {
    if (tasks.length) {
      console.log(`Map tasks: ${tasks.length}`);
    }
  }, [tasks]);

  // Connection handling
  const handleTaskSelect = useCallback(
    (id: string) => {
      if (connectionMode) {
        if (!connectionSource) {
          // First task selected for connection
          setConnectionSource(id);
        } else if (connectionSource !== id) {
          // Second task selected, create connection
          const newConnectionId = `connection_${Date.now()}`;
          setConnections((prev) => [
            ...prev,
            {
              id: newConnectionId,
              source: connectionSource,
              target: id,
              animated: true,
            },
          ]);
          // Reset connection mode
          setConnectionMode(false);
          setConnectionSource(null);
        }
      } else {
        // Regular selection mode
        setSelectedTaskId((prev) => (prev === id ? null : id));
      }
    },
    [connectionMode, connectionSource],
  );

  // Overlay management
  const handleOpenOverlay = () => setIsOverlayOpen(true);
  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setNewTaskName("");
    setNewTaskDescription("");
    setNewTaskPhoto(null);
  };

  // Add a new task from the overlay form
  const handleAddTaskFromOverlay = () => {
    if (!newTaskName.trim()) {
      alert("Task name is required.");
      return;
    }

    const newTaskId = `task_${Date.now()}`;
    const newTask: TaskNodeData = {
      id: newTaskId,
      type: "customTask",
      label: newTaskName,
      description: newTaskDescription,
      image:
        newTaskPhoto instanceof File
          ? URL.createObjectURL(newTaskPhoto)
          : typeof newTaskPhoto === "string"
            ? newTaskPhoto
            : null,
      // Default position (will be updated when dropped on map)
      position: [51.4, -0.25],
    };

    setAvailableTasks((prev) => [...prev, newTask]);
    handleCloseOverlay();
  };

  // Handle dropping a new task on the map
  const handleTaskDrop = useCallback(
    (nodeType: string, position: [number, number], taskId?: string) => {
      if (taskId) {
        // A task was dragged from the available tasks section
        const task = availableTasks.find((t) => t.id === taskId);

        if (task) {
          // Add the task to the map with the dropped position
          const newTask: TaskNodeData = {
            ...task,
            position,
          };

          // First remove from available tasks, then add to map tasks
          setAvailableTasks((prev) => prev.filter((t) => t.id !== taskId));
          setTasks((prev) => [...prev, newTask]);
        }
      } else {
        // A task type was dragged from the left sidebar
        const newTaskId = `${nodeType}_${Date.now()}`;
        const newTask: TaskNodeData = {
          id: newTaskId,
          type: nodeType,
          label:
            nodeType === "defaultTask" ? "New Default Task" : "New Custom Task",
          position,
        };

        setTasks((prev) => [...prev, newTask]);
      }
    },
    [availableTasks],
  );

  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;

    // Handle dragover to allow dropping
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    // Handle drop event directly
    const handleDrop = (e: DragEvent) => {
      console.log("Direct DOM drop event detected", e);
      handleDirectDrop(e, handleTaskDrop, leafletMapInstanceRef.current);
    };

    // Add event listeners
    mapContainer.addEventListener("dragover", handleDragOver);
    mapContainer.addEventListener("drop", handleDrop);

    // Clean up
    return () => {
      mapContainer.removeEventListener("dragover", handleDragOver);
      mapContainer.removeEventListener("drop", handleDrop);
    };
  }, [handleTaskDrop]);

  // Handle task drag end to update position
  const handleTaskDragEnd = useCallback(
    (id: string, position: [number, number]) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, position } : task)),
      );
    },
    [],
  );

  // Remove the selected task
  const handleRemoveSelected = () => {
    if (selectedTaskId) {
      // Remove the task
      setTasks((prev) => prev.filter((task) => task.id !== selectedTaskId));

      // Remove any connections to/from this task
      setConnections((prev) =>
        prev.filter(
          (conn) =>
            conn.source !== selectedTaskId && conn.target !== selectedTaskId,
        ),
      );

      // Clear selection
      setSelectedTaskId(null);
    } else {
      alert("No task selected to remove.");
    }
  };

  // Handle drag start for dragging from task types panel
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    // Set only one data format to avoid conflicts
    event.dataTransfer.setData("application/nodeType", nodeType);
    event.dataTransfer.effectAllowed = "copy";
  };

  // Find the selected task for display in sidebar
  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null;

  return (
    <PageTemplate>
      <NavbarTemplate />
      <Overlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        blockClassName="max-w-lg bg-ev-primary rounded-xl shadow-2xl p-6 z-10"
      >
        <h2 className="text-3xl font-semibold mb-6 text-ev-text">
          Add Custom Task
        </h2>
        <section className="flex flex-col justify-center items-center gap-5 w-full">
          <input
            type="text"
            name="name_text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
            placeholder="Task Name..."
          />
          <textarea
            name="textarea"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
            placeholder="Task description (optional)..."
          />
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-lg text-ev-text">Select photo (optional):</p>
            <Input
              name="select_photo_task"
              type="file"
              className="text-ev-text"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setNewTaskPhoto(file);
                }
              }}
            />
          </section>
          <button
            onClick={handleAddTaskFromOverlay}
            className="mt-4 w-full text-ev-white bg-ev-blue hover:bg-ev-darkblue font-semibold rounded-lg px-6 py-3 hover:scale-105 duration-300 transition-all focus:outline-none focus:ring-2 focus:ring-mc-blue focus:ring-opacity-50"
          >
            Add Task to Workspace
          </button>
        </section>
      </Overlay>

      <section className="flex flex-row items-start h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px))] gap-8 w-[95vw] mx-auto pt-4">
        <SidebarTemplate activeIcon="map" />
        <section className="flex flex-row w-full justify-center h-full gap-4">
          {/* Task Types Sidebar */}
          <aside className="flex flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-60 sticky top-4">
            <h3 className="text-xl font-semibold mb-2 text-ev-text">
              Task Types
            </h3>
            <p className="text-sm text-ev-text italic mb-2">
              Drag task types to the map
            </p>
            <section
              draggable={true}
              onDragStart={(e) => handleDragStart(e, "defaultTask")}
              className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 group"
              title="Drag to place on map"
            >
              <Image
                src="/outlet.png"
                alt="Default Task"
                width={24}
                height={24}
              />
              <span className="text-ev-text flex-grow">Default Task</span>
              <span className="text-gray-400 group-hover:text-gray-600 text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                </svg>
              </span>
            </section>
            <section
              draggable={true}
              onDragStart={(e) => handleDragStart(e, "customTask")}
              className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 group"
              title="Drag to place on map"
            >
              <Image
                src="/problem.png"
                alt="Custom Task"
                width={24}
                height={24}
              />
              <span className="text-ev-text flex-grow">Custom Task</span>
              <span className="text-gray-400 group-hover:text-gray-600 text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                </svg>
              </span>
            </section>
          </aside>

          {/* Main Content Area */}
          <main className="flex flex-col h-full flex-grow">
            <section className="flex flex-wrap items-center w-full bg-ev-primary p-3 rounded-xl gap-3 mb-4 shadow-md">
              <Input
                name="add_task_button"
                type="button"
                className="text-ev-white bg-ev-green hover:bg-ev-darkgreen font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ev-green-darker duration-300"
                value="Add Custom Task"
                onClick={handleOpenOverlay}
                title="Create new task in sidebar"
              />
              <Input
                name="remove_task_button"
                type="button"
                className="text-ev-white bg-ev-red hover:bg-ev-darkred font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ev-red-darker duration-300"
                value="Remove Selected"
                onClick={handleRemoveSelected}
                title="Remove selected task from map"
              />
              <Input
                name="connect_tasks_button"
                type="button"
                className={`text-ev-white ${
                  connectionMode
                    ? "bg-ev-orange"
                    : "bg-ev-blue hover:bg-ev-darkblue"
                } font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-mc-blue-darker duration-300`}
                value={connectionMode ? "Cancel Connection" : "Connect Tasks"}
                onClick={() => {
                  setConnectionMode(!connectionMode);
                  setConnectionSource(null);
                }}
                title={
                  connectionMode
                    ? "Cancel creating connection"
                    : "Create connection between two tasks"
                }
              />
              <SearchButton />
            </section>

            {/* Map Area */}
            <section
              className="flex-grow h-full rounded-2xl overflow-hidden shadow-lg relative"
              ref={mapContainerRef}
            >
              {/* Drag instructions overlay */}
              <div className="absolute top-2 left-0 right-0 flex justify-center z-[999] pointer-events-none">
                <div className="bg-ev-primary bg-opacity-80 text-ev-text px-4 py-2 rounded-lg shadow-md text-sm">
                  Drag tasks from sidebars and drop them on the map
                </div>
              </div>
              {/* Status info */}
              <div className="absolute bottom-2 left-2 z-[999] bg-white bg-opacity-70 p-2 rounded text-xs">
                Available: {availableTasks.length} | On Map: {tasks.length}
              </div>

              {/* Leaflet Map */}
              <LeafletMap
                tasks={tasks}
                connections={connections}
                selectedTaskId={selectedTaskId}
                onTaskSelect={handleTaskSelect}
                onTaskDrop={handleTaskDrop}
                onTaskDragEnd={handleTaskDragEnd}
                setMapInstance={(map) => {
                  leafletMapInstanceRef.current = map;
                }}
              />

              {/* Connection in progress indicator */}
              {connectionMode && connectionSource && (
                <div className="absolute top-0 left-0 right-0 bg-ev-orange text-white p-2 text-center z-[1000]">
                  Select a second task to complete the connection
                </div>
              )}
            </section>
          </main>

          {/* Task Details and Available Tasks Sidebar */}
          <aside className="flex flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-72 sticky top-4">
            {/* Available Tasks Section */}
            <section>
              <h3 className="text-xl font-semibold mb-2 text-ev-text">
                Available Tasks
              </h3>
              {availableTasks.length > 0 && (
                <p className="text-sm text-ev-text italic mb-2">
                  Drag tasks to the map to place them
                </p>
              )}
              <div className="space-y-2 mb-4">
                {availableTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable={true}
                    onDragStart={(e) => {
                      // Set only one data format to avoid conflicts
                      e.dataTransfer.setData("application/taskId", task.id);

                      // Highlight the task being dragged
                      e.currentTarget.classList.add(
                        "bg-blue-100",
                        "border-blue-400",
                      );

                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onDragEnd={(e) => {
                      // Remove highlight when drag ends
                      e.currentTarget.classList.remove(
                        "bg-blue-100",
                        "border-blue-400",
                      );
                    }}
                    className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 group"
                  >
                    <Image
                      src={
                        task.type === "defaultTask"
                          ? "/outlet.png"
                          : "/problem.png"
                      }
                      alt={task.label}
                      width={24}
                      height={24}
                    />
                    <span className="text-ev-text truncate flex-grow">
                      {task.label}
                    </span>
                    <span className="text-gray-400 group-hover:text-gray-600 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                      </svg>
                    </span>
                  </div>
                ))}
                {availableTasks.length === 0 && (
                  <p className="text-sm text-ev-text italic p-2">
                    Add custom tasks to see them here
                  </p>
                )}
              </div>
            </section>

            <hr className="border-gray-200 my-2" />

            {/* Task Details Section */}
            <h3 className="text-xl font-semibold mb-2 text-ev-text">
              Task Details
            </h3>
            {selectedTask ? (
              <section className="p-3 border border-gray-200 rounded-lg text-sm text-ev-text space-y-2">
                <p>
                  <strong>ID:</strong> {selectedTask.id}
                </p>
                <p>
                  <strong>Label:</strong> {selectedTask.label}
                </p>
                {selectedTask.description && (
                  <p>
                    <strong>Description:</strong> {selectedTask.description}
                  </p>
                )}
                {selectedTask.image &&
                  typeof selectedTask.image === "string" && (
                    <Image
                      src={selectedTask.image}
                      alt="Task image"
                      width={64}
                      height={64}
                      className="rounded mt-2 object-cover"
                    />
                  )}
                <p>
                  <strong>Position:</strong> {selectedTask.position.join(", ")}
                </p>
              </section>
            ) : (
              <section className="p-3 border border-gray-200 rounded-md text-sm text-ev-text">
                Select a task on the map to see its details.
              </section>
            )}
            {/* Decorative image */}
            <Image
              src="/outlet.png"
              alt="Task Detail Visual"
              width={60}
              height={60}
              className="w-16 h-16 mt-2 self-center opacity-50"
            />
          </aside>
        </section>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}

export default function EmployeesOverview() {
  return <MapEditor />;
}
