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

// Initial data
const initialTasks: TaskNodeData[] = [
  {
    id: "1",
    type: "defaultTask",
    label: "Task 1 - Drag Me!",
    position: [51.505, -0.09],
  },
  {
    id: "2",
    type: "customTask",
    label: "Task 2",
    position: [51.51, -0.1],
  },
];

const initialConnections: TaskConnection[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
];

// Main editor component
function MapEditor() {
  const { User } = useUserContext();
  const coverPhotoValue = User.currentWorkspace?.coverPhoto;

  // State management
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskNodeData[]>(initialTasks);
  const [connections, setConnections] =
    useState<TaskConnection[]>(initialConnections);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);

  // New task form state
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPhoto, setNewTaskPhoto] = useState<File | null>(null);

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
      image: newTaskPhoto ? URL.createObjectURL(newTaskPhoto) : null,
      // Random position near the center of the map
      position: [51.505 + Math.random() * 0.01, -0.09 + Math.random() * 0.01],
    };

    setTasks((prev) => [...prev, newTask]);
    handleCloseOverlay();
  };

  // Handle dropping a new task on the map
  const handleTaskDrop = useCallback(
    (nodeType: string, position: [number, number]) => {
      const newTaskId = `${nodeType}_${Date.now()}`;
      const newTask: TaskNodeData = {
        id: newTaskId,
        type: nodeType,
        label:
          nodeType === "defaultTask" ? "New Default Task" : "New Custom Task",
        position,
      };

      setTasks((prev) => [...prev, newTask]);
    },
    [],
  );

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
    event.dataTransfer.setData("application/nodeType", nodeType);
    event.dataTransfer.effectAllowed = "move";
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
        blockClassName="max-w-lg bg-ev-primary rounded-xl shadow-2xl p-6"
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
                  setNewTaskPhoto(e.target.files[0]);
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
            <section
              draggable
              onDragStart={(e) => handleDragStart(e, "defaultTask")}
              className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
            >
              <Image
                src="/outlet.png"
                alt="Default Task"
                width={24}
                height={24}
              />
              <span className="text-ev-text">Default Task</span>
            </section>
            <section
              draggable
              onDragStart={(e) => handleDragStart(e, "customTask")}
              className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
            >
              <Image
                src="/problem.png"
                alt="Custom Task"
                width={24}
                height={24}
              />
              <span className="text-ev-text">Custom Task</span>
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
              />
              <Input
                name="remove_task_button"
                type="button"
                className="text-ev-white bg-ev-red hover:bg-ev-darkred font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ev-red-darker duration-300"
                value="Remove Selected"
                onClick={handleRemoveSelected}
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
              />
              <Input
                name="change_plan_button"
                type="button"
                className="text-ev-white bg-ev-blue hover:bg-ev-darkblue font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-mc-blue-darker duration-300"
                value="Change Plan"
              />
              <SearchButton />
            </section>

            {/* Map Area */}
            <section className="flex-grow h-full rounded-2xl overflow-hidden shadow-lg relative">
              {/* Leaflet Map */}
              <LeafletMap
                tasks={tasks}
                connections={connections}
                selectedTaskId={selectedTaskId}
                onTaskSelect={handleTaskSelect}
                onTaskDrop={handleTaskDrop}
                onTaskDragEnd={handleTaskDragEnd}
              />

              {/* Connection in progress indicator */}
              {connectionMode && connectionSource && (
                <div className="absolute top-0 left-0 right-0 bg-ev-orange text-white p-2 text-center z-[1000]">
                  Select a second task to complete the connection
                </div>
              )}
            </section>
          </main>

          {/* Task Details Sidebar */}
          <aside className="flex flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-72 sticky top-4">
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
                {selectedTask.image && (
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
