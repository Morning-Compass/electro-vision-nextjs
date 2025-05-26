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
import { useForm, SubmitHandler, Control } from "react-hook-form";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import toast from "react-hot-toast";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import { DateTimePicker } from "@/components/datepicker/Datepicker";
import { WorkspaceUser } from "@/ev-types/user-types";

// Define types
interface TaskNodeData {
  id: string;
  label: string;
  description?: string;
  image?: string | null;
  position: [number, number];
  type: string;
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

type TaskFormProps = {
  title: string;
  description: string;
  assignee_email: string;
  importance: "LOW" | "MEDIUM" | "HIGH";
  category: string;
  due_date?: string;
  multimedia?: string;
};

interface TaskApiResponse {
  id: number;
  title: string;
  description?: string;
  importance: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
  assignee_email: string;
}

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
      Loading map editor...
    </div>
  ),
});

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

  let position: [number, number] = [51.5, -0.1];

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
    onDrop("customTask", position, taskId);
  } else if (nodeType) {
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

const initialTasks: TaskNodeData[] = [];
const initialConnections: TaskConnection[] = [];

interface AddTaskFormForMapProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (
    apiResponse: TaskApiResponse,
    mapPosition: [number, number],
    nodeType: string,
  ) => void;
  initialPosition: [number, number] | null;
  initialNodeType: string | null;
  currentUserEmail: string | undefined;
  currentWorkspaceId: string | undefined;
  workspaceUsers: WorkspaceUser[] | null;
}

const AddTaskFormForMap: React.FC<AddTaskFormForMapProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialPosition,
  initialNodeType,
  currentUserEmail,
  currentWorkspaceId,
  workspaceUsers,
}) => {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    reset,
    setValue,
    control,
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
      multimedia: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

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
      const taskPayload = {
        assigner_email: currentUserEmail,
        assignee_email: data.assignee_email,
        title: data.title,
        description: data.description,
        importance: data.importance,
        category: data.category,
        status: "TODO",
        due_date: data.due_date || null,
        description_multimedia: data.multimedia || null,
      };

      const res = await OLF.post(
        ApiLinks.createTasks(currentWorkspaceId),
        taskPayload,
      );

      try {
        await OLF.post(ApiLinks.addPythonTask, {
          task_id: res.id,
          workspace_id: Number.parseInt(currentWorkspaceId),
          offset_x: initialPosition[0],
          offset_y: initialPosition[1],
        });
        toast.success("Task created successfully!");
        onSubmitSuccess(res, initialPosition, initialNodeType);
        reset();
        onClose();
      } catch (error) {
        await OLF.delete(
          ApiLinks.removeTask(currentWorkspaceId.toString(), res.id.toString()),
          {},
        );
        console.error("Error creating task:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create task",
        );
      }
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
        className="flex flex-col gap-6 w-full text-ev-text"
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
      >
        <h2 className="text-3xl font-semibold mb-4">
          Create New Task ({initialNodeType})
        </h2>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskTitleMap" className="text-lg">
              Title*
            </label>
            <Input
              id="taskTitleMap"
              type="text"
              placeholder="Task title..."
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              error={errors.title?.message}
              register={register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              })}
            />
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskDescriptionMap" className="text-lg">
              Description
            </label>
            <Input
              id="taskDescriptionMap"
              type="text"
              placeholder="Task description..."
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              error={errors.description?.message}
              register={register("description")}
            />
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="multimedia-file" className="text-lg">
              Photo
            </label>
            <label
              htmlFor="multimedia-file"
              className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg cursor-pointer w-full hover:scale-105 transition text-left"
            >
              Upload Photo
            </label>
            <input
              id="multimedia-file"
              type="file"
              accept="image/png, image/jpeg"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  setValue("multimedia", base64, { shouldValidate: true });
                };
                reader.readAsDataURL(file);
              }}
            />
            <input type="hidden" {...register("multimedia")} />
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskAssigneeMap" className="text-lg">
              Assignee Email*
            </label>
            <select
              id="taskAssigneeMap"
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg hover:scale-105 transition appearance-none focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              {...register("assignee_email", {
                required: "Assignee is required",
              })}
            >
              {workspaceUsers && workspaceUsers.length > 0 ? (
                workspaceUsers.map((u, i) => (
                  <option key={i} value={u.email}>
                    {u.email}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No users available
                </option>
              )}
            </select>
            {errors.assignee_email && (
              <p className="text-ev-red text-sm mt-1">
                {errors.assignee_email.message}
              </p>
            )}
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskImportanceMap" className="text-lg">
              Importance*
            </label>
            <select
              id="taskImportanceMap"
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg hover:scale-105 transition appearance-none focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              {...register("importance", {
                required: "Importance is required",
              })}
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
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskCategoryMap" className="text-lg">
              Category
            </label>
            <Input
              id="taskCategoryMap"
              type="text"
              placeholder="e.g., Lamps, Sockets"
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              error={errors.category?.message}
              register={register("category")}
            />
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="due_date" className="text-lg">
              Due Date
            </label>
            <DateTimePicker
              name="due_date"
              control={control as Control<TaskFormProps>}
              className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg w-full"
            />
            {errors.due_date && (
              <p className="text-ev-red text-sm mt-1">
                {errors.due_date.message}
              </p>
            )}
          </div>
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

interface AddTaskOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (task: TaskNodeData) => void;
  currentUserEmail: string | undefined;
  currentWorkspaceId: string | undefined;
  workspaceUsers: WorkspaceUser[] | null;
}

const AddTaskOverlay: React.FC<AddTaskOverlayProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  currentUserEmail,
  currentWorkspaceId,
  workspaceUsers,
}) => {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    reset,
    setValue,
    control,
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
      multimedia: "",
    },
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleFormSubmit: SubmitHandler<TaskFormProps> = async (data) => {
    if (!currentUserEmail || !currentWorkspaceId) {
      toast.error("Cannot add task: user or workspace context is missing.");
      return;
    }

    try {
      const taskPayload = {
        assigner_email: currentUserEmail,
        assignee_email: data.assignee_email,
        title: data.title,
        description: data.description,
        importance: data.importance,
        category: data.category,
        status: "TODO",
        due_date: data.due_date || null,
        description_multimedia: data.multimedia || null,
      };

      const res = await OLF.post(
        ApiLinks.createTasks(currentWorkspaceId),
        taskPayload,
      );

      const newTask: TaskNodeData = {
        id: res.id.toString(),
        label: res.title,
        description: res.description,
        image: res.description_multimedia
          ? `data:image/jpeg;base64,${res.description_multimedia}`
          : null,
        position: [0, 0],
        type: "customTask",
        importance: res.importance,
        category: res.category,
        assignee_email: res.assignee_email,
      };

      onSubmitSuccess(newTask);
      reset();
      onClose();
      toast.success("Task created successfully!");
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
        className="flex flex-col gap-6 w-full text-ev-text"
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
      >
        <h2 className="text-3xl font-semibold mb-4">Create New Task</h2>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskTitle" className="text-lg">
              Title*
            </label>
            <Input
              id="taskTitle"
              type="text"
              placeholder="Task title..."
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              error={errors.title?.message}
              register={register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              })}
            />
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskDescription" className="text-lg">
              Description
            </label>
            <Input
              id="taskDescription"
              type="text"
              placeholder="Task description..."
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              error={errors.description?.message}
              register={register("description")}
            />
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="multimedia-file-overlay" className="text-lg">
              Photo
            </label>
            <label
              htmlFor="multimedia-file-overlay"
              className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg cursor-pointer w-full hover:scale-105 transition text-left"
            >
              Upload Photo
            </label>
            <input
              id="multimedia-file-overlay"
              type="file"
              accept="image/png, image/jpeg"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  setValue("multimedia", base64, { shouldValidate: true });
                };
                reader.readAsDataURL(file);
              }}
            />
            <input type="hidden" {...register("multimedia")} />
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskAssignee" className="text-lg">
              Assignee Email*
            </label>
            <select
              id="taskAssignee"
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg hover:scale-105 transition appearance-none focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              {...register("assignee_email", {
                required: "Assignee is required",
              })}
            >
              {workspaceUsers && workspaceUsers.length > 0 ? (
                workspaceUsers.map((u, i) => (
                  <option key={i} value={u.email}>
                    {u.email}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No users available
                </option>
              )}
            </select>
            {errors.assignee_email && (
              <p className="text-ev-red text-sm mt-1">
                {errors.assignee_email.message}
              </p>
            )}
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskImportance" className="text-lg">
              Importance*
            </label>
            <select
              id="taskImportance"
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg hover:scale-105 transition appearance-none focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              {...register("importance", {
                required: "Importance is required",
              })}
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
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="taskCategory" className="text-lg">
              Category
            </label>
            <Input
              id="taskCategory"
              type="text"
              placeholder="e.g., Lamps, Sockets"
              className="w-full p-3 bg-ev-gray text-ev-dark-gray rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
              error={errors.category?.message}
              register={register("category")}
            />
          </div>
        </FormErrorWrap>

        <FormErrorWrap>
          <div className="flex flex-col gap-2">
            <label htmlFor="due_date_overlay" className="text-lg">
              Due Date
            </label>
            <DateTimePicker
              name="due_date"
              control={control as Control<TaskFormProps>}
              className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg w-full"
            />
            {errors.due_date && (
              <p className="text-ev-red text-sm mt-1">
                {errors.due_date.message}
              </p>
            )}
          </div>
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
            value={isSubmitting ? "Creating..." : "Create Task"}
            disabled={isSubmitting}
            className="text-ev-white bg-ev-blue hover:bg-ev-darkblue font-semibold rounded-lg px-6 py-3 hover:scale-105 duration-300 transition-all focus:outline-none focus:ring-2 focus:ring-mc-blue focus:ring-opacity-50"
          />
        </div>
      </form>
    </Overlay>
  );
};

function MapEditor() {
  const { User } = useUserContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskNodeData[]>(initialTasks);
  const [connections, setConnections] =
    useState<TaskConnection[]>(initialConnections);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<TaskNodeData[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[] | null>(
    null,
  );
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false);
  const [droppedTaskDetails, setDroppedTaskDetails] = useState<{
    position: [number, number];
    nodeType: string;
  } | null>(null);

  // Fetch workspace users
  const getWorkers = async () => {
    try {
      const res = await OLF.post(
        ApiLinks.listWorkspaceUsersByWorkspaceIdAndEmail(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
        ),
        {
          email: User.authUser?.email,
        },
      );
      const workers: WorkspaceUser[] = res;
      setWorkspaceUsers(workers);
    } catch (error) {
      console.error("Failed to fetch workspace users:", error);
      toast.error("Failed to load workspace users.");
    }
  };

  // Fetch and match tasks from both backends
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const workspaceId =
          User.workspaceData?.currentWorkspace?.id?.toString();
        if (!workspaceId) {
          toast.error("Workspace ID not found.");
          return;
        }
        const ownerEmail = User.authUser?.email;
        if (!ownerEmail) {
          toast.error("User email not found.");
          return;
        }

        // Fetch tasks from Python backend
        const pythonResponse = await OLF.get(
          ApiLinks.listPythonTasks(workspaceId.toString()),
        );
        const pythonTasks = pythonResponse.data;

        // Fetch tasks from Rust backend
        const rustResponse = await OLF.post(ApiLinks.listTasks(workspaceId), {
          owner_email: ownerEmail,
        });
        const rustTasks = rustResponse;

        // Match all Python tasks with Rust data
        const matchedTasks = pythonTasks
          .map((pyTask: any) => {
            const rustTask = rustTasks.find(
              (rTask: any) => rTask.id === pyTask.task_id,
            );
            if (rustTask) {
              return {
                id: rustTask.id.toString(),
                label: rustTask.title,
                description: rustTask.description,
                image: rustTask.description_multimedia
                  ? `data:image/jpeg;base64,${rustTask.description_multimedia}`
                  : null,
                position: [pyTask.offset_x, pyTask.offset_y],
                type: "customTask",
                importance: rustTask.importance,
                category: rustTask.category,
                assignee_email: rustTask.assignee_email,
              };
            }
            return null;
          })
          .filter((task: TaskNodeData | null) => task !== null);

        setTasks(matchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // toast.error("Failed to load tasks.");
      }
    };

    if (User.workspaceData?.currentWorkspace?.id && User.authUser?.email) {
      fetchTasks();
    }
  }, [User]);

  useEffect(() => {
    getWorkers();
  }, []);

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
  const handleCloseOverlay = () => setIsOverlayOpen(false);

  const handleAddTaskSuccess = useCallback((newTask: TaskNodeData) => {
    setAvailableTasks((prev) => [...prev, newTask]);
  }, []);

  const handleNewTaskFormSubmitSuccess = (
    apiResponse: TaskApiResponse,
    mapPosition: [number, number],
    nodeType: string,
  ) => {
    const newMapTask: TaskNodeData = {
      id: apiResponse.id?.toString() || `api_task_${Date.now()}`,
      label: apiResponse.title,
      description: apiResponse.description,
      position: mapPosition,
      type: nodeType,
      importance: apiResponse.importance,
      category: apiResponse.category,
      assignee_email: apiResponse.assignee_email,
    };
    setTasks((prevTasks) => [...prevTasks, newMapTask]);
    setIsNewTaskFormOpen(false);
    setDroppedTaskDetails(null);
    toast.success(`Task "${newMapTask.label}" created and added to map!`);
  };

  const handleTaskDrop = useCallback(
    (nodeType: string, position: [number, number], taskId?: string) => {
      if (taskId) {
        const taskToMove = availableTasks.find((t) => t.id === taskId);
        if (taskToMove) {
          const newTaskOnMap: TaskNodeData = { ...taskToMove, position };
          setAvailableTasks((prev) => prev.filter((t) => t.id !== taskId));
          setTasks((prevMapTasks) => [...prevMapTasks, newTaskOnMap]);
          toast.success(`Task "${newTaskOnMap.label}" added to map.`);
        }
      } else {
        setDroppedTaskDetails({ position, nodeType });
        setIsNewTaskFormOpen(true);
      }
    },
    [availableTasks],
  );

  const handleTaskDragEnd = useCallback(
    async (id: string, position: [number, number]) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, position } : task)),
      );

      const workspaceId = User.workspaceData?.currentWorkspace?.id;
      if (!workspaceId) return;

      const taskId = parseInt(id, 10);
      if (isNaN(taskId)) return;

      const payload = {
        task_id: taskId,
        workspace_id: workspaceId,
        offset_x: position[0],
        offset_y: position[1],
      };

      try {
        await OLF.put(ApiLinks.updatePythonTask(), payload);
      } catch (error) {
        console.error("Error updating task position:", error);
        toast.error("Failed to update task position.");
      }
    },
    [User],
  );

  const handleRemoveSelected = async () => {
    if (!selectedTaskId) return;

    const workspaceId = User.workspaceData?.currentWorkspace?.id;
    const taskId = parseInt(selectedTaskId, 10);
    if (!workspaceId || isNaN(taskId)) return;

    try {
      const task = await OLF.delete(
        ApiLinks.removeTask(workspaceId.toString(), taskId.toString()),
        {},
      );
      try {
        await OLF.delete(
          ApiLinks.removePythonTask(
            workspaceId.toString(),
            selectedTaskId.toString(),
          ),
          {},
        );
      } catch (error) {
        const taskPayload = {
          assigner_email: User.authUser?.email,
          assignee_email: task.assignee_email,
          title: task.title,
          description: task.description,
          importance: task.importance,
          category: task.category,
          status: task.status,
          due_date: task.due_date,
          description_multimedia: task.description_multimedia,
        };
        await OLF.post(ApiLinks.createTasks(task.workspace_id), taskPayload);
      }
      setTasks((prev) => prev.filter((task) => task.id !== selectedTaskId));
      setConnections((prev) =>
        prev.filter(
          (conn) =>
            conn.source !== selectedTaskId && conn.target !== selectedTaskId,
        ),
      );
      setSelectedTaskId(null);
      toast.success(`Task removed from map.`);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please try again.");
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
      handleDirectDrop(e, handleTaskDrop, leafletMapInstanceRef.current);
    };

    mapContainer.addEventListener("dragover", handleDragOver);
    mapContainer.addEventListener("drop", handleDrop);

    return () => {
      mapContainer.removeEventListener("dragover", handleDragOver);
      mapContainer.removeEventListener("drop", handleDrop);
    };
  }, [handleTaskDrop]);

  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null;

  return (
    <PageTemplate>
      <NavbarTemplate />
      <AddTaskOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        onSubmitSuccess={handleAddTaskSuccess}
        currentUserEmail={User.authUser?.email}
        currentWorkspaceId={User.workspaceData?.currentWorkspace?.id?.toString()}
        workspaceUsers={workspaceUsers}
      />

      <AddTaskFormForMap
        isOpen={isNewTaskFormOpen}
        onClose={() => {
          setIsNewTaskFormOpen(false);
          setDroppedTaskDetails(null);
        }}
        onSubmitSuccess={handleNewTaskFormSubmitSuccess}
        initialPosition={droppedTaskDetails?.position || null}
        initialNodeType={droppedTaskDetails?.nodeType || null}
        currentUserEmail={User.authUser?.email}
        currentWorkspaceId={User.workspaceData?.currentWorkspace?.id?.toString()}
        workspaceUsers={workspaceUsers}
      />

      <section className="flex flex-row items-center justify-start h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="map" />
        <section className="flex flex-row w-full justify-center h-full gap-4 max-lg:text-sm max-lg:flex-col">
          <section className="flex flex-row gap-8">
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
                  src="/outlet.png"
                  alt="Default Task Type"
                  width={24}
                  height={24}
                />
                <span className="text-ev-text flex-grow">Default Task</span>
              </section>
              <section
                draggable={true}
                onDragStart={(e) => handleDragStart(e, "customTask")}
                className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 group"
                title="Drag to place a new 'Custom Task' on map"
              >
                <Image
                  src="/problem.png"
                  alt="Custom Task Type"
                  width={24}
                  height={24}
                />
                <span className="text-ev-text flex-grow">Custom Task</span>
              </section>
            </aside>

            <aside className="hidden flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-72 sticky top-4 max-lg:block">
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
                      onDragStart={(e) => handleDragStart(e, task.id, true)}
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
                    <strong>Position:</strong>{" "}
                    {selectedTask.position.join(", ")}
                  </p>
                </section>
              ) : (
                <section className="p-3 border border-gray-200 rounded-md text-sm text-ev-text">
                  Select a task on the map to see its details.
                </section>
              )}
            </aside>
          </section>

          <main className="flex flex-col h-full flex-grow">
            <section className="flex flex-wrap items-center w-full bg-ev-primary p-3 rounded-xl gap-3 mb-4 shadow-md">
              <Input
                type="button"
                className="text-ev-white bg-ev-green hover:bg-ev-darkgreen font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ev-green-darker duration-300"
                value="Add Task to Workspace List"
                onClick={handleOpenOverlay}
                title="Create new task and add to 'Available Tasks' sidebar"
              />
              <Input
                type="button"
                className="text-ev-white bg-ev-red hover:bg-ev-darkred font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ev-red-darker duration-300"
                value="Remove Selected from Map"
                onClick={handleRemoveSelected}
                title="Remove selected task from map"
              />
              <Input
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
              <div className="absolute top-2 left-0 right-0 flex justify-center z-[1] pointer-events-none">
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
                onTaskDrop={handleTaskDrop}
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

          <aside className="flex flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-72 sticky top-4 max-lg:hidden">
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
                    onDragStart={(e) => handleDragStart(e, task.id, true)}
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
