"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import Image from "next/image";
import SearchButton from "@/components/SearchButton";
import Input from "@/components/Input"; // Make sure your Input component can handle react-hook-form's register
import Overlay from "@/components/Overlay";
import useUserContext from "@/ev-contexts/userContextProvider";
import "leaflet/dist/leaflet.css";

// Imports needed for the new AddTaskFormForMap
import { useForm, SubmitHandler } from "react-hook-form";
import FormErrorWrap from "@/components/templates/FormErrorWrap"; // Adjust path if necessary
import Regex from "@/ev-const/regex"; // Adjust path if necessary
import toast from "react-hot-toast"; // Ensure Toaster is set up in your app
import OLF from "@/ev-lib/ElectroVisionFetch"; // Adjust path if necessary
import ApiLinks from "@/ev-const/api-links"; // Adjust path if necessary

// Define types for our data structures
interface TaskNodeData {
  id: string;
  label: string;
  description?: string;
  image?: string | null;
  position: [number, number];
  type: string; // e.g., "defaultTask", "customTask" or more specific from API if needed
  // You might want to add other fields from TaskFormProps if they need to be displayed or used on the map
  importance?: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
  assignee_email?: string;
}

interface TaskConnection {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

// Type for the form data when adding a task via drag-drop (based on AddTaskLogic)
type TaskFormProps = {
  title: string;
  description: string;
  assignee_email: string;
  importance: "LOW" | "MEDIUM" | "HIGH";
  category: string;
  due_date?: string;
  due_time?: string;
};

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
      Loading map editor...
    </div>
  ),
});

// Helper function to handle drop events directly (remains largely the same)
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

  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let position: [number, number] = [51.5, -0.1]; // Default fallback

  if (map && map.containerPointToLatLng) {
    const point = map.containerPointToLatLng([x, y]);
    position = [point.lat, point.lng];
  }

  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return;

  const taskId = dataTransfer.getData("application/taskId");
  const nodeType = !taskId ? dataTransfer.getData("application/nodeType") : "";

  if (taskId) {
    const feedback = document.createElement("div");
    feedback.className =
      "absolute z-[2000] bg-green-500 text-white px-2 py-1 rounded";
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.textContent = "Moved!";
    (event.target as HTMLElement).appendChild(feedback);
    setTimeout(() => feedback.remove(), 800);
    onDrop("customTask", position, taskId); // type here might be arbitrary if taskId is present
  } else if (nodeType) {
    // Visual feedback for new task drop (before form opens)
    const feedback = document.createElement("div");
    feedback.className =
      "absolute z-[2000] bg-blue-500 text-white px-2 py-1 rounded";
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.textContent = "Define Task...";
    (event.target as HTMLElement).appendChild(feedback);
    setTimeout(() => feedback.remove(), 1200);
    onDrop(nodeType, position);
  }
}

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

// New Component: AddTaskFormForMap (Adapted from your AddTaskLogic)
interface AddTaskFormForMapProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (
    apiResponse: any,
    mapPosition: [number, number],
    nodeType: string,
  ) => void;
  initialPosition: [number, number] | null;
  initialNodeType: string | null;
  currentUserEmail: string | undefined;
  currentWorkspaceId: string | undefined;
}

const AddTaskFormForMap: React.FC<AddTaskFormForMapProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialPosition,
  initialNodeType,
  currentUserEmail,
  currentWorkspaceId,
}) => {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    reset,
    setError,
  } = useForm<TaskFormProps>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      importance: "LOW",
      title: "",
      description: "",
      assignee_email: "",
      category: "",
      due_date: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Optionally pre-fill based on initialNodeType or other props
      // For example:
      // if (initialNodeType === 'defaultTask') {
      //   setValue('category', 'Default Category');
      // }
    } else {
      reset(); // Reset form when overlay is closed or not open
    }
  }, [isOpen, reset, initialNodeType]);

  const handleFormSubmit: SubmitHandler<TaskFormProps> = async (data) => {
    if (!initialPosition || !initialNodeType) {
      toast.error("Cannot add task: critical map information is missing.");
      return;
    }
    if (!currentUserEmail || !currentWorkspaceId) {
      toast.error("Cannot add task: user or workspace context is missing.");
      return;
    }

    try {
      const hasDate = !!data.due_date;
      const hasTime = !!data.due_time;

      if (hasDate !== hasTime) {
        setError("due_date", { message: "Both fields required" });
        setError("due_time", { message: "Both fields required" });
        toast.error("Please provide both date and time or leave both empty");
        return;
      }

      const fullDueDate =
        hasDate && hasTime ? `${data.due_date}T${data.due_time}:00` : null;

      const taskPayload = {
        assigner_email: currentUserEmail,
        assignee_email: data.assignee_email,
        title: data.title,
        description: data.description,
        importance: data.importance,
        category: data.category,
        status: "TODO",
        due_date: fullDueDate,
        description_multimedia: null,
      };

      const res = await OLF.post(
        ApiLinks.createTasks(currentWorkspaceId),
        taskPayload,
      );

      toast.success("Task created successfully!");
      onSubmitSuccess(res.data, initialPosition, initialNodeType);
      reset();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create task",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      blockClassName="max-w-lg bg-ev-primary rounded-xl shadow-2xl p-6 z-[1001]"
    >
      <form
        className="flex flex-col gap-5 w-full text-ev-text"
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
      >
        <h2 className="text-3xl font-semibold mb-4">
          Define New Task ({initialNodeType})
        </h2>

        <FormErrorWrap>
          <label htmlFor="taskTitleMap" className="text-lg text-ev-text">
            Title*
          </label>
          <Input
            id="taskTitleMap"
            name="title" // react-hook-form uses 'name'
            type="text"
            placeholder="Task title..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none bg-ev-gray text-ev-dark-gray"
            error={errors.title?.message} // For Input component to display error
            register={register("title", {
              required: "Title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters",
              },
            })}
          />
        </FormErrorWrap>

        <FormErrorWrap>
          <label htmlFor="taskDescriptionMap" className="text-lg text-ev-text">
            Description
          </label>
          <textarea
            id="taskDescriptionMap"
            placeholder="Task description..."
            className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none bg-ev-gray text-ev-dark-gray"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-ev-red text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </FormErrorWrap>

        <FormErrorWrap>
          <label htmlFor="taskAssigneeMap" className="text-lg text-ev-text">
            Assignee Email*
          </label>
          <Input
            id="taskAssigneeMap"
            name="assignee_email"
            type="email"
            placeholder="assignee@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none bg-ev-gray text-ev-dark-gray"
            error={errors.assignee_email?.message}
            register={register("assignee_email", {
              required: "Assignee email is required",
              pattern: {
                value: Regex.emailRegistration,
                message: "Invalid email format",
              }, // Use Regex.email or Regex.emailRegistration as defined
            })}
          />
        </FormErrorWrap>

        <FormErrorWrap>
          <label htmlFor="taskImportanceMap" className="text-lg text-ev-text">
            Importance*
          </label>
          <select
            id="taskImportanceMap"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none bg-ev-gray text-ev-dark-gray"
            {...register("importance", { required: "Importance is required" })}
            defaultValue="LOW"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          {errors.importance && (
            <p className="text-ev-red text-sm mt-1">
              {errors.importance.message}
            </p>
          )}
        </FormErrorWrap>

        <FormErrorWrap>
          <label htmlFor="taskCategoryMap" className="text-lg text-ev-text">
            Category
          </label>
          <Input
            id="taskCategoryMap"
            name="category"
            type="text"
            placeholder="e.g., Installation, Repair"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none bg-ev-gray text-ev-dark-gray"
            error={errors.category?.message}
            register={register("category")}
          />
        </FormErrorWrap>

        <FormErrorWrap>
          <Input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg w-full"
            register={register("due_date")}
          />
        </FormErrorWrap>

        {/* Time Input */}
        <FormErrorWrap>
          <Input
            type="time"
            className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg w-full"
            register={register("due_time")}
          />
        </FormErrorWrap>

        <div className="flex items-center justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <Input
            type="submit"
            value={isSubmitting ? "Creating..." : "Create Task & Add"}
            disabled={isSubmitting}
            className="text-ev-white bg-ev-blue hover:bg-ev-darkblue font-semibold rounded-lg px-6 py-3 hover:scale-105 duration-300 transition-all focus:outline-none focus:ring-2 focus:ring-mc-blue focus:ring-opacity-50"
          />
        </div>
      </form>
    </Overlay>
  );
};

function MapEditor() {
  const { User } = useUserContext(); // Get User context

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);

  const [isOverlayOpen, setIsOverlayOpen] = useState(false); // For the original "Add Custom Task" sidebar
  const [tasks, setTasks] = useState<TaskNodeData[]>(initialTasks);
  const [connections, setConnections] =
    useState<TaskConnection[]>(initialConnections);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<TaskNodeData[]>([]);

  // State for the original overlay form
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPhoto, setNewTaskPhoto] = useState<File | string | null>(null);

  // State for the new task form triggered by drag-drop
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false);
  const [droppedTaskDetails, setDroppedTaskDetails] = useState<{
    position: [number, number];
    nodeType: string;
  } | null>(null);

  useEffect(() => {
    if (availableTasks.length) {
      console.log(`Available tasks in sidebar: ${availableTasks.length}`);
    }
  }, [availableTasks]);

  useEffect(() => {
    if (tasks.length) {
      console.log(`Tasks on map: ${tasks.length}`);
    }
  }, [tasks]);

  const handleTaskSelect = useCallback(
    (id: string) => {
      if (connectionMode) {
        if (!connectionSource) {
          setConnectionSource(id);
        } else if (connectionSource !== id) {
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
          setConnectionMode(false);
          setConnectionSource(null);
        }
      } else {
        setSelectedTaskId((prev) => (prev === id ? null : id));
      }
    },
    [connectionMode, connectionSource],
  );

  const handleOpenOverlay = () => setIsOverlayOpen(true);
  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setNewTaskName("");
    setNewTaskDescription("");
    setNewTaskPhoto(null);
  };

  const handleAddTaskFromOverlay = () => {
    // Adds to "Available Tasks" sidebar
    if (!newTaskName.trim()) {
      alert("Task name is required.");
      return;
    }
    const newTaskId = `task_${Date.now()}`;
    const newTask: TaskNodeData = {
      id: newTaskId,
      type: "customTask", // default from this form
      label: newTaskName,
      description: newTaskDescription,
      image:
        newTaskPhoto instanceof File
          ? URL.createObjectURL(newTaskPhoto)
          : typeof newTaskPhoto === "string"
            ? newTaskPhoto
            : null,
      position: [51.4, -0.25], // This is a placeholder, task is not on map yet
    };
    setAvailableTasks((prev) => [...prev, newTask]);
    handleCloseOverlay();
  };

  // Callback for successful submission of the new drag-drop task form
  const handleNewTaskFormSubmitSuccess = (
    apiResponse: any, // Define this based on your API's task structure
    mapPosition: [number, number],
    nodeType: string, // The original nodeType dropped, e.g., "defaultTask"
  ) => {
    const newMapTask: TaskNodeData = {
      id: apiResponse.id?.toString() || `api_task_${Date.now()}`, // Prefer ID from API
      label: apiResponse.title,
      description: apiResponse.description,
      // image: apiResponse.image_url || null, // If your API returns an image URL for the task
      position: mapPosition,
      type: nodeType, // Use the originally dropped nodeType or one from API if it's more specific
      importance: apiResponse.importance,
      category: apiResponse.category,
      assignee_email: apiResponse.assignee_email,
      // Add any other relevant fields from apiResponse to TaskNodeData
    };

    setTasks((prevTasks) => [...prevTasks, newMapTask]);
    setIsNewTaskFormOpen(false);
    setDroppedTaskDetails(null); // Clear the stored details
    toast.success(`Task "${newMapTask.label}" created and added to map!`);
  };

  const handleTaskDrop = useCallback(
    (nodeType: string, position: [number, number], taskId?: string) => {
      if (taskId) {
        // A task was dragged from the available tasks sidebar to the map
        const taskToMove = availableTasks.find((t) => t.id === taskId);
        if (taskToMove) {
          const newTaskOnMap: TaskNodeData = { ...taskToMove, position };
          setAvailableTasks((prev) => prev.filter((t) => t.id !== taskId)); // Remove from available
          setTasks((prevMapTasks) => [...prevMapTasks, newTaskOnMap]); // Add to map
          toast.success(`Task "${newTaskOnMap.label}" added to map.`);
        }
      } else {
        // A task TYPE was dragged from the "Task Types" sidebar to the map
        console.log(
          `Task type '${nodeType}' dropped at ${position}. Opening creation form.`,
        );
        setDroppedTaskDetails({ position, nodeType });
        setIsNewTaskFormOpen(true);
        // The actual addition to map tasks will happen after successful form submission
        // via handleNewTaskFormSubmitSuccess
      }
    },
    [availableTasks], // User.workspaceData?.currentWorkspace?.id, User.authUser?.email can be removed if not directly used here
    // but they are dependencies for the AddTaskFormForMap component passed later
  );

  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };
    const handleDrop = (e: DragEvent) => {
      console.log("Direct DOM drop event detected", e);
      handleDirectDrop(e, handleTaskDrop, leafletMapInstanceRef.current);
    };
    mapContainer.addEventListener("dragover", handleDragOver);
    mapContainer.addEventListener("drop", handleDrop);
    return () => {
      mapContainer.removeEventListener("dragover", handleDragOver);
      mapContainer.removeEventListener("drop", handleDrop);
    };
  }, [handleTaskDrop]); // handleTaskDrop is a dependency

  const handleTaskDragEnd = useCallback(
    (id: string, position: [number, number]) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, position } : task)),
      );
    },
    [],
  );

  const handleRemoveSelected = () => {
    if (selectedTaskId) {
      const taskToRemove = tasks.find((task) => task.id === selectedTaskId);
      setTasks((prev) => prev.filter((task) => task.id !== selectedTaskId));
      setConnections((prev) =>
        prev.filter(
          (conn) =>
            conn.source !== selectedTaskId && conn.target !== selectedTaskId,
        ),
      );
      setSelectedTaskId(null);
      if (taskToRemove) {
        toast.success(`Task "${taskToRemove.label}" removed from map.`);
      }
    } else {
      alert("No task selected to remove.");
    }
  };

  const handleDragStart = (
    event: React.DragEvent,
    nodeTypeOrId: string,
    isExistingTask: boolean = false,
  ) => {
    if (isExistingTask) {
      event.dataTransfer.setData("application/taskId", nodeTypeOrId);
    } else {
      event.dataTransfer.setData("application/nodeType", nodeTypeOrId);
    }
    event.dataTransfer.effectAllowed = "copy";
  };

  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null;

  return (
    <PageTemplate>
      <NavbarTemplate />
      {/* Overlay for adding tasks to "Available Tasks" sidebar */}
      <Overlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        blockClassName="max-w-lg bg-ev-primary rounded-xl shadow-2xl p-6 z-[1001]"
      >
        <h2 className="text-3xl font-semibold mb-6 text-ev-text">
          Add Custom Task to Workspace
        </h2>
        <section className="flex flex-col justify-center items-center gap-5 w-full">
          <input
            type="text"
            name="name_text_sidebar"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
            placeholder="Task Name..."
          />
          <textarea
            name="textarea_sidebar"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
            placeholder="Task description (optional)..."
          />
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-lg text-ev-text">Select photo (optional):</p>
            <Input
              name="select_photo_task_sidebar"
              type="file"
              className="text-ev-text" // Ensure Input component handles file types correctly
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                // Typed event
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
            Add Task to Workspace List
          </button>
        </section>
      </Overlay>

      {/* Overlay for adding NEW task directly to MAP after drag-drop type */}
      <AddTaskFormForMap
        isOpen={isNewTaskFormOpen}
        onClose={() => {
          setIsNewTaskFormOpen(false);
          setDroppedTaskDetails(null); // Clear details when closing form
        }}
        onSubmitSuccess={handleNewTaskFormSubmitSuccess}
        initialPosition={droppedTaskDetails?.position || null}
        initialNodeType={droppedTaskDetails?.nodeType || null}
        currentUserEmail={User.authUser?.email}
        currentWorkspaceId={User.workspaceData?.currentWorkspace?.id?.toString()}
      />

      <section className="flex flex-row items-start h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px))] gap-8 w-[95vw] mx-auto pt-4 z-0">
        <SidebarTemplate activeIcon="map" />
        <section className="flex flex-row w-full justify-center h-full gap-4">
          {/* Task Types Sidebar */}
          <aside className="flex flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-60 sticky top-4">
            <h3 className="text-xl font-semibold mb-2 text-ev-text">
              Task Types
            </h3>
            <p className="text-sm text-ev-text italic mb-2">
              Drag task types to the map to create & place them
            </p>
            <section
              draggable={true}
              onDragStart={(e) => handleDragStart(e, "defaultTask")}
              className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 group"
              title="Drag to place a new 'Default Task' on map"
            >
              <Image
                src="/outlet.png" // Replace with actual icon for default task
                alt="Default Task Type"
                width={24}
                height={24}
              />
              <span className="text-ev-text flex-grow">Default Task</span>
              {/* Drag handle icon */}
            </section>
            <section
              draggable={true}
              onDragStart={(e) => handleDragStart(e, "customTask")}
              className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 group"
              title="Drag to place a new 'Custom Task' on map"
            >
              <Image
                src="/problem.png" // Replace with actual icon for custom task
                alt="Custom Task Type"
                width={24}
                height={24}
              />
              <span className="text-ev-text flex-grow">Custom Task</span>
              {/* Drag handle icon */}
            </section>
          </aside>

          {/* Main Content Area */}
          <main className="flex flex-col h-full flex-grow">
            <section className="flex flex-wrap items-center w-full bg-ev-primary p-3 rounded-xl gap-3 mb-4 shadow-md">
              <Input
                name="add_task_to_sidebar_button"
                type="button"
                className="text-ev-white bg-ev-green hover:bg-ev-darkgreen font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ev-green-darker duration-300"
                value="Add Task to Workspace List"
                onClick={handleOpenOverlay} // This opens the sidebar task adder
                title="Create new task and add to 'Available Tasks' sidebar"
              />
              <Input
                name="remove_task_button"
                type="button"
                className="text-ev-white bg-ev-red hover:bg-ev-darkred font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ev-red-darker duration-300"
                value="Remove Selected from Map"
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
                    : "Create connection between two tasks on map"
                }
              />
              <SearchButton />
            </section>

            <section
              className="flex-grow h-full rounded-2xl overflow-hidden shadow-lg relative"
              ref={mapContainerRef}
            >
              <div className="absolute top-2 left-0 right-0 flex justify-center z-[999] pointer-events-none">
                <div className="bg-ev-primary bg-opacity-80 text-ev-text px-4 py-2 rounded-lg shadow-md text-sm">
                  Drag tasks from sidebars and drop them on the map
                </div>
              </div>
              <div className="absolute bottom-2 left-2 z-[999] bg-white bg-opacity-70 p-2 rounded text-xs">
                Available in Sidebar: {availableTasks.length} | On Map:{" "}
                {tasks.length}
              </div>
              <LeafletMap
                tasks={tasks}
                connections={connections}
                selectedTaskId={selectedTaskId}
                onTaskSelect={handleTaskSelect}
                onTaskDrop={handleTaskDrop} // Still used by LeafletMap for internal drops if any, but direct DOM drop is primary
                onTaskDragEnd={handleTaskDragEnd}
                setMapInstance={(map) => {
                  leafletMapInstanceRef.current = map;
                }}
              />
              {connectionMode && connectionSource && (
                <div className="absolute top-0 left-0 right-0 bg-ev-orange text-white p-2 text-center z-[1000]">
                  Select a second task to complete the connection
                </div>
              )}
            </section>
          </main>

          {/* Task Details and Available Tasks Sidebar */}
          <aside className="flex flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-72 sticky top-4">
            <section>
              <h3 className="text-xl font-semibold mb-2 text-ev-text">
                Available Tasks
              </h3>
              {availableTasks.length > 0 && (
                <p className="text-sm text-ev-text italic mb-2">
                  Drag tasks from here to the map to place them
                </p>
              )}
              <div className="space-y-2 mb-4">
                {availableTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, task.id, true)} // Pass true for isExistingTask
                    onDragEnd={(e) => {
                      e.currentTarget.classList.remove(
                        "bg-blue-100",
                        "border-blue-400",
                      );
                    }}
                    className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 group"
                  >
                    <Image
                      src={
                        task.image ||
                        (task.type === "defaultTask"
                          ? "/outlet.png"
                          : "/problem.png")
                      }
                      alt={task.label}
                      width={24}
                      height={24}
                      className="rounded object-cover"
                    />
                    <span className="text-ev-text truncate flex-grow">
                      {task.label}
                    </span>
                    {/* Drag handle icon */}
                  </div>
                ))}
                {availableTasks.length === 0 && (
                  <p className="text-sm text-ev-text italic p-2">
                    No tasks in the workspace list. Add some using the button
                    above.
                  </p>
                )}
              </div>
            </section>
            <hr className="border-gray-200 my-2" />
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
                {selectedTask.assignee_email && (
                  <p>
                    <strong>Assignee:</strong> {selectedTask.assignee_email}
                  </p>
                )}
                {selectedTask.importance && (
                  <p>
                    <strong>Importance:</strong> {selectedTask.importance}
                  </p>
                )}
                {selectedTask.category && (
                  <p>
                    <strong>Category:</strong> {selectedTask.category}
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
