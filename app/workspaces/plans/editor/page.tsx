"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import Image from "next/image";
import Overlay from "@/components/Overlay";
import useUserContext from "@/ev-contexts/userContextProvider";
import { useForm, SubmitHandler, Control } from "react-hook-form";
import toast from "react-hot-toast";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import { DateTimePicker } from "@/components/datepicker/Datepicker";
import { WorkspaceUser } from "@/ev-types/user-types";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GitBranch,
  Pencil,
  Layers,
  ClipboardList,
  X,
  Upload,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

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
  image?: string;
  description?: string;
  importance: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
  assignee_email: string;
}

// ── Dynamic imports ────────────────────────────────────────────────────────

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0f172a] text-slate-500 text-sm">
      Loading map editor…
    </div>
  ),
});

const DrawCanvas = dynamic(() => import("./DrawCanvas"), { ssr: false });

// ── Shared styles ──────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all";
const labelCls = "text-xs font-medium text-slate-400 block mb-1.5";

// ── Drop handler ───────────────────────────────────────────────────────────

function handleDirectDrop(
  event: DragEvent,
  onDrop: (nodeType: string, position: [number, number], taskId?: string) => void,
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
    feedback.className = "absolute z-[2000] bg-green-500 text-white px-2 py-1 rounded text-xs";
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.textContent = "Moved!";
    (event.target as HTMLElement).appendChild(feedback);
    setTimeout(() => feedback.remove(), 800);
    onDrop("customTask", position, taskId);
  } else if (nodeType) {
    const feedback = document.createElement("div");
    feedback.className = "absolute z-[2000] bg-blue-500 text-white px-2 py-1 rounded text-xs";
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.textContent = "Define Task…";
    (event.target as HTMLElement).appendChild(feedback);
    setTimeout(() => feedback.remove(), 1200);
    onDrop(nodeType, position);
  }
}

const initialTasks: TaskNodeData[] = [];
const initialConnections: TaskConnection[] = [];

// ── AddTaskFormForMap ──────────────────────────────────────────────────────

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
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleFormSubmit: SubmitHandler<TaskFormProps> = async (data) => {
    if (!initialPosition || !initialNodeType) {
      toast.error("Cannot add task: map information is missing.");
      return;
    }
    if (!currentUserEmail || !currentWorkspaceId) {
      toast.error("Cannot add task: user or workspace context is missing.");
      return;
    }
    try {
      const res = await OLF.post(ApiLinks.createTasks(currentWorkspaceId), {
        assigner_email: currentUserEmail,
        assignee_email: data.assignee_email,
        image: data.multimedia,
        title: data.title,
        description: data.description,
        importance: data.importance,
        category: data.category,
        status: "TODO",
        due_date: data.due_date || null,
        description_multimedia: data.multimedia || null,
      });
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
        toast.error(error instanceof Error ? error.message : "Failed to create task");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create task");
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <p className="text-xl font-bold text-slate-100">Create Task ({initialNodeType})</p>

        <div>
          <label className={labelCls}>Title *</label>
          <input type="text" placeholder="Task title…" className={inputCls}
            {...register("title", { required: "Required", minLength: { value: 3, message: "Min 3 chars" } })} />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <input type="text" placeholder="Description…" className={inputCls} {...register("description")} />
        </div>

        <div>
          <label className={labelCls}>Photo</label>
          <label htmlFor="map-task-photo" className="flex items-center gap-2 w-full cursor-pointer bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-400 hover:border-ev-yellow/40 transition-all">
            <Upload className="w-4 h-4" /> Upload Photo
          </label>
          <input id="map-task-photo" type="file" accept="image/png,image/jpeg" capture="environment" className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => setValue("multimedia", reader.result as string, { shouldValidate: true });
              reader.readAsDataURL(file);
            }} />
          <input type="hidden" {...register("multimedia")} />
        </div>

        <div>
          <label className={labelCls}>Assignee *</label>
          <div className="flex gap-2">
            <select className={`${inputCls} appearance-none flex-1`}
              {...register("assignee_email", { required: "Required" })}>
              <option value="" disabled>Select…</option>
              {workspaceUsers?.map((u, i) => <option key={i} value={u.email}>{u.email}</option>)}
            </select>
            <button type="button"
              onClick={() => { if (currentUserEmail) setValue("assignee_email", currentUserEmail, { shouldValidate: true }); }}
              className="px-3 py-2 bg-[#1e293b] border border-[#334155] text-slate-300 rounded-xl text-xs hover:border-ev-yellow/40 transition-all whitespace-nowrap">
              Me
            </button>
          </div>
          {errors.assignee_email && <p className="text-xs text-red-400 mt-1">{errors.assignee_email.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Importance *</label>
          <select className={`${inputCls} appearance-none`} {...register("importance", { required: "Required" })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <input type="text" placeholder="e.g. Lamps" className={inputCls} {...register("category")} />
        </div>

        <div>
          <label className={labelCls}>Due Date</label>
          <DateTimePicker name="due_date" control={control as Control<TaskFormProps>} className={inputCls} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-3 bg-[#0f172a] border border-[#334155] text-slate-300 rounded-xl text-sm hover:text-slate-100 hover:border-[#475569] transition-all">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? "Creating…" : "Create & Place"}
          </button>
        </div>
      </form>
    </Overlay>
  );
};

// ── AddTaskOverlay ─────────────────────────────────────────────────────────

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
      const res = await OLF.post(ApiLinks.createTasks(currentWorkspaceId), {
        assigner_email: currentUserEmail,
        assignee_email: data.assignee_email,
        title: data.title,
        image: data.multimedia,
        description: data.description,
        importance: data.importance,
        category: data.category,
        status: "TODO",
        due_date: data.due_date || null,
        description_multimedia: data.multimedia || null,
        task_type: "MAP",
      });
      try {
        await OLF.post(ApiLinks.addPythonTask, {
          task_id: res.id.toString(),
          workspace_id: currentWorkspaceId,
          offset_x: 0,
          offset_y: 0,
        });
      } catch (error) {
        await OLF.delete(
          ApiLinks.removeTask(currentWorkspaceId.toString(), res.id.toString()),
        );
        toast.error(error instanceof Error ? error.message : "Failed to add Python task");
        return;
      }
      const newTask: TaskNodeData = {
        id: res.id.toString(),
        label: res.title,
        description: res.description,
        image: res.description_multimedia,
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
      toast.error(error instanceof Error ? error.message : "Failed to create task");
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <p className="text-xl font-bold text-slate-100">Add Task to Workspace List</p>

        <div>
          <label className={labelCls}>Title *</label>
          <input type="text" placeholder="Task title…" className={inputCls}
            {...register("title", { required: "Required", minLength: { value: 3, message: "Min 3 chars" } })} />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <input type="text" placeholder="Description…" className={inputCls} {...register("description")} />
        </div>

        <div>
          <label className={labelCls}>Photo</label>
          <label htmlFor="overlay-task-photo" className="flex items-center gap-2 w-full cursor-pointer bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-400 hover:border-ev-yellow/40 transition-all">
            <Upload className="w-4 h-4" /> Upload Photo
          </label>
          <input id="overlay-task-photo" type="file" accept="image/png,image/jpeg" capture="environment" className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => setValue("multimedia", reader.result as string, { shouldValidate: true });
              reader.readAsDataURL(file);
            }} />
          <input type="hidden" {...register("multimedia")} />
        </div>

        <div>
          <label className={labelCls}>Assignee *</label>
          <div className="flex gap-2">
            <select className={`${inputCls} appearance-none flex-1`}
              {...register("assignee_email", { required: "Required" })}>
              <option value="" disabled>Select…</option>
              {workspaceUsers?.map((u, i) => <option key={i} value={u.email}>{u.email}</option>)}
            </select>
            <button type="button"
              onClick={() => { if (currentUserEmail) setValue("assignee_email", currentUserEmail, { shouldValidate: true }); }}
              className="px-3 py-2 bg-[#1e293b] border border-[#334155] text-slate-300 rounded-xl text-xs hover:border-ev-yellow/40 transition-all whitespace-nowrap">
              Me
            </button>
          </div>
          {errors.assignee_email && <p className="text-xs text-red-400 mt-1">{errors.assignee_email.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Importance *</label>
          <select className={`${inputCls} appearance-none`} {...register("importance", { required: "Required" })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <input type="text" placeholder="e.g. Lamps" className={inputCls} {...register("category")} />
        </div>

        <div>
          <label className={labelCls}>Due Date</label>
          <DateTimePicker name="due_date" control={control as Control<TaskFormProps>} className={inputCls} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-3 bg-[#0f172a] border border-[#334155] text-slate-300 rounded-xl text-sm hover:text-slate-100 hover:border-[#475569] transition-all">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? "Creating…" : "Create Task"}
          </button>
        </div>
      </form>
    </Overlay>
  );
};

// ── MapEditor ──────────────────────────────────────────────────────────────

function MapEditor() {
  const { User } = useUserContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);

  const [drawMode, setDrawMode] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskNodeData[]>(initialTasks);
  const [connections, setConnections] = useState<TaskConnection[]>(initialConnections);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<TaskNodeData[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[] | null>(null);
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false);
  const [droppedTaskDetails, setDroppedTaskDetails] = useState<{
    position: [number, number];
    nodeType: string;
  } | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const isCreator = User.workspaceData?.currentWorkspace?.role === "CREATOR";

  // ── Fetch workspace users ──
  const getWorkers = async () => {
    try {
      const res = await OLF.post(
        ApiLinks.listWorkspaceUsersByWorkspaceIdAndEmail(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
        ),
        { email: User.authUser?.email },
      );
      setWorkspaceUsers(res as WorkspaceUser[]);
    } catch (error) {
      console.error("Failed to fetch workspace users:", error);
    }
  };

  // ── Fetch tasks ──
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const workspaceId = User.workspaceData?.currentWorkspace?.id?.toString();
        if (!workspaceId) { toast.error("Workspace ID not found."); return; }
        const ownerEmail = User.authUser?.email;
        if (!ownerEmail) { toast.error("User email not found."); return; }

        const pythonResponse = await OLF.get(ApiLinks.listPythonTasks(workspaceId.toString()));
        const pythonTasks = pythonResponse.data;

        const rustResponse = await OLF.post(ApiLinks.listTasks(workspaceId), { owner_email: ownerEmail });
        const rustTasks = rustResponse;

        const matchedTasks = pythonTasks
          .map((pyTask: any) => {
            const rustTask = rustTasks.find((rTask: any) => rTask.id === pyTask.task_id);
            if (rustTask && rustTask.task_type === "DEFAULT") {
              return {
                id: rustTask.id.toString(),
                label: rustTask.title,
                description: rustTask.description,
                image: rustTask.description_multimedia,
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

        const mapTasks: TaskNodeData[] = rustResponse
          .filter((task: any) => task.task_type === "MAP")
          .map((task: any) => ({
            id: task.id.toString(),
            label: task.title,
            description: task.description,
            image: task.description_multimedia,
            importance: task.importance,
            category: task.category,
            assignee_email: task.assignee_email,
          }));

        setAvailableTasks(mapTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (User.workspaceData?.currentWorkspace?.id && User.authUser?.email) {
      fetchTasks();
    }
  }, [User]);

  useEffect(() => { getWorkers(); }, []);

  // ── Handlers ──
  const handleTaskSelect = useCallback(
    (id: string) => {
      if (connectionMode) {
        if (!connectionSource) {
          setConnectionSource(id);
        } else if (connectionSource !== id) {
          setConnections((prev) => [
            ...prev,
            { id: `connection_${Date.now()}`, source: connectionSource, target: id, animated: true },
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

  const handleAddTaskSuccess = useCallback(async () => {
    try {
      const workspaceId = User.workspaceData?.currentWorkspace?.id?.toString();
      if (!workspaceId) { toast.error("Workspace ID not found."); return; }
      const ownerEmail = User.authUser?.email;
      if (!ownerEmail) { toast.error("User email not found."); return; }
      const response = await OLF.post(ApiLinks.listTasks(workspaceId), { owner_email: ownerEmail });
      const mapTasks: TaskNodeData[] = response
        .filter((task: any) => task.task_type === "MAP")
        .map((task: any) => ({
          id: task.id.toString(),
          label: task.title,
          description: task.description,
          image: task.description_multimedia,
          importance: task.importance,
          category: task.category,
          assignee_email: task.assignee_email,
        }));
      setAvailableTasks(mapTasks);
    } catch (error) {
      toast.error("Failed to refresh task list");
    }
  }, [User.authUser?.email, User.workspaceData?.currentWorkspace?.id]);

  const handleNewTaskFormSubmitSuccess = (
    apiResponse: TaskApiResponse,
    mapPosition: [number, number],
    nodeType: string,
  ) => {
    const newMapTask: TaskNodeData = {
      id: apiResponse.id?.toString() || `api_task_${Date.now()}`,
      image: apiResponse.image,
      label: apiResponse.title,
      description: apiResponse.description,
      position: mapPosition,
      type: nodeType,
      importance: apiResponse.importance,
      category: apiResponse.category,
      assignee_email: apiResponse.assignee_email,
    };
    setTasks((prev) => [...prev, newMapTask]);
    setIsNewTaskFormOpen(false);
    setDroppedTaskDetails(null);
    toast.success(`Task "${newMapTask.label}" added to map!`);
  };

  const handleTaskDrop = useCallback(
    async (nodeType: string, position: [number, number], taskId?: string) => {
      try {
        const workspaceId = User.workspaceData?.currentWorkspace?.id;
        if (!workspaceId) { toast.error("Workspace context missing"); return; }

        if (taskId) {
          const taskToMove = availableTasks.find((t) => t.id === taskId);
          if (!taskToMove) { toast.error("Task not found in available tasks"); return; }

          const rustRes = await OLF.post(ApiLinks.createTasks(workspaceId.toString()), {
            assigner_email: User.authUser?.email,
            assignee_email: taskToMove.assignee_email,
            title: taskToMove.label,
            image: taskToMove.image,
            description: taskToMove.description,
            importance: taskToMove.importance,
            category: taskToMove.category,
            status: "TODO",
            due_date: null,
            description_multimedia: taskToMove.image,
            task_type: "DEFAULT",
          });

          const newTaskId = rustRes.id.toString();
          const newTaskOnMap: TaskNodeData = { ...taskToMove, id: newTaskId, position };
          setTasks((prev) => [...prev, newTaskOnMap]);
          toast.success(`Task "${newTaskOnMap.label}" added to map.`);

          try {
            await OLF.post(ApiLinks.addPythonTask, {
              task_id: newTaskId,
              workspace_id: workspaceId,
              offset_x: position[0],
              offset_y: position[1],
            });
          } catch (error: any) {
            await OLF.delete(ApiLinks.removeTask(workspaceId.toString(), newTaskId));
            setTasks((prev) => prev.filter((t) => t.id !== newTaskId));
            toast.error(error instanceof Error ? error.message : "Failed to register task position.");
          }
        } else {
          setDroppedTaskDetails({ position, nodeType });
          setIsNewTaskFormOpen(true);
        }
      } catch (error: any) {
        toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
      }
    },
    [availableTasks, User.workspaceData?.currentWorkspace?.id, User.authUser?.email, handleAddTaskSuccess],
  );

  const handleTaskDragEnd = useCallback(
    async (id: string, position: [number, number]) => {
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, position } : task)));
      const workspaceId = User.workspaceData?.currentWorkspace?.id;
      if (!workspaceId) return;
      const taskId = parseInt(id, 10);
      if (isNaN(taskId)) return;
      try {
        await OLF.put(ApiLinks.updatePythonTask(), {
          task_id: taskId,
          workspace_id: workspaceId,
          offset_x: position[0],
          offset_y: position[1],
        });
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
          ApiLinks.removePythonTask(workspaceId.toString(), selectedTaskId.toString()),
          {},
        );
      } catch (error) {
        await OLF.post(ApiLinks.createTasks(task.workspace_id), {
          assigner_email: User.authUser?.email,
          assignee_email: task.assignee_email,
          title: task.title,
          image: task.multimedia,
          description: task.description,
          importance: task.importance,
          category: task.category,
          status: task.status,
          due_date: task.due_date,
          description_multimedia: task.description_multimedia,
        });
      }
      setTasks((prev) => prev.filter((task) => task.id !== selectedTaskId));
      setConnections((prev) =>
        prev.filter((conn) => conn.source !== selectedTaskId && conn.target !== selectedTaskId),
      );
      setSelectedTaskId(null);
      toast.success("Task removed from map.");
    } catch (error) {
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
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
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

  const selectedTask = selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : null;

  // ── Toolbar button class helpers ──
  const toolbarBtnBase = "flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-all";
  const panelToggleBtn = (active: boolean) =>
    `${toolbarBtnBase} ${active
      ? "bg-ev-yellow/10 border-ev-yellow/30 text-ev-yellow"
      : "bg-[#1e293b] border-[#334155] text-slate-400 hover:text-slate-100 hover:border-[#475569]"
    }`;

  // ── Render ──
  return (
    <PageTemplate>
      <AddTaskOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        onSubmitSuccess={handleAddTaskSuccess}
        currentUserEmail={User.authUser?.email ?? undefined}
        currentWorkspaceId={User.workspaceData?.currentWorkspace?.id?.toString()}
        workspaceUsers={workspaceUsers}
      />
      <AddTaskFormForMap
        isOpen={isNewTaskFormOpen}
        onClose={() => { setIsNewTaskFormOpen(false); setDroppedTaskDetails(null); }}
        onSubmitSuccess={handleNewTaskFormSubmitSuccess}
        initialPosition={droppedTaskDetails?.position || null}
        initialNodeType={droppedTaskDetails?.nodeType || null}
        currentUserEmail={User.authUser?.email ?? undefined}
        currentWorkspaceId={User.workspaceData?.currentWorkspace?.id?.toString()}
        workspaceUsers={workspaceUsers}
      />

      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />

          {/* ── Editor body ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0f1e]">

            {/* ── Toolbar ── */}
            {isCreator && (
              <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 bg-[#0f172a] border-b border-[#334155]">
                {/* Back */}
                <Link
                  href="../plans"
                  className={`${toolbarBtnBase} bg-[#1e293b] border-[#334155] text-slate-300 hover:text-slate-100 hover:border-[#475569]`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Back</span>
                </Link>

                <div className="w-px h-5 bg-[#334155]" />

                {/* Panel toggles */}
                <button
                  onClick={() => setShowLeftPanel((p) => !p)}
                  className={panelToggleBtn(showLeftPanel)}
                  title="Toggle task types panel"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Types</span>
                </button>
                <button
                  onClick={() => setShowRightPanel((p) => !p)}
                  className={panelToggleBtn(showRightPanel)}
                  title="Toggle tasks panel"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tasks</span>
                </button>

                <div className="w-px h-5 bg-[#334155]" />

                {/* Actions */}
                <button
                  onClick={handleOpenOverlay}
                  className={`${toolbarBtnBase} bg-ev-yellow/10 border-ev-yellow/20 text-ev-yellow hover:bg-ev-yellow/20`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Task</span>
                </button>
                <button
                  onClick={handleRemoveSelected}
                  disabled={!selectedTaskId}
                  className={`${toolbarBtnBase} bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
                <button
                  onClick={() => { setConnectionMode(!connectionMode); setConnectionSource(null); }}
                  className={`${toolbarBtnBase} ${connectionMode
                    ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{connectionMode ? "Cancel" : "Connect"}</span>
                </button>
                <button
                  onClick={() => setDrawMode(!drawMode)}
                  className={`${toolbarBtnBase} ${drawMode
                    ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                    : "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{drawMode ? "Exit Draw" : "Draw"}</span>
                </button>

                {/* stats */}
                <div className="ml-auto text-[10px] text-slate-600 hidden md:block">
                  Sidebar: {availableTasks.length} · Map: {tasks.length}
                </div>
              </div>
            )}

            {/* Connection mode banner */}
            {connectionMode && connectionSource && (
              <div className="flex-shrink-0 bg-orange-500/15 border-b border-orange-500/30 text-orange-300 text-xs text-center py-2">
                Select a second task on the map to complete the connection
              </div>
            )}

            {/* ── 3-column layout ── */}
            <div className="flex-1 flex overflow-hidden">

              {/* Left panel — Task Types */}
              {isCreator && (
                <>
                  {/* Mobile backdrop */}
                  <div
                    className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${showLeftPanel ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    onClick={() => setShowLeftPanel(false)}
                  />
                  {/* Panel */}
                  <aside
                    className={`
                      flex flex-col bg-[#0f172a] border-r border-[#334155] overflow-y-auto flex-shrink-0
                      transition-all duration-300
                      fixed top-0 left-0 h-full z-50 w-64
                      ${showLeftPanel ? "translate-x-0" : "-translate-x-full"}
                      md:relative md:top-auto md:bottom-auto md:h-auto md:z-auto md:translate-x-0
                      ${showLeftPanel ? "md:w-56" : "md:w-0 md:overflow-hidden"}
                    `}
                  >
                    <div className="p-4 min-w-[14rem]">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Types</p>
                        <button
                          onClick={() => setShowLeftPanel(false)}
                          className="md:hidden w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mb-4">Drag onto the map to place</p>

                      <div className="flex flex-col gap-2">
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, "defaultTask")}
                          className="flex items-center gap-3 p-3 bg-[#1e293b] border border-[#334155] rounded-xl cursor-grab hover:border-ev-yellow/40 hover:bg-[#1e293b]/60 transition-all group active:scale-95"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Image src="/outlet.png" alt="Default Task" width={18} height={18} />
                          </div>
                          <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">Default Task</span>
                        </div>
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, "customTask")}
                          className="flex items-center gap-3 p-3 bg-[#1e293b] border border-[#334155] rounded-xl cursor-grab hover:border-ev-yellow/40 hover:bg-[#1e293b]/60 transition-all group active:scale-95"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Image src="/problem.png" alt="Custom Task" width={18} height={18} />
                          </div>
                          <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">Custom Task</span>
                        </div>
                      </div>
                    </div>
                  </aside>
                </>
              )}

              {/* Center — Map */}
              <main
                className="flex-1 relative overflow-hidden"
                ref={mapContainerRef}
              >
                {/* Hint banner */}
                <div className="absolute top-3 left-0 right-0 flex justify-center z-[1] pointer-events-none">
                  <div className="bg-[#0f172a]/90 border border-[#334155] text-slate-400 px-3 py-1.5 rounded-xl text-xs shadow-lg">
                    Drag tasks from the panels onto the map
                  </div>
                </div>

                <LeafletMap
                  tasks={tasks}
                  connections={connections}
                  selectedTaskId={selectedTaskId}
                  onTaskSelect={handleTaskSelect}
                  onTaskDrop={handleTaskDrop}
                  onTaskDragEnd={handleTaskDragEnd}
                  drawEnabled={drawMode}
                  setMapInstance={(map) => { leafletMapInstanceRef.current = map; }}
                />
                <DrawCanvas
                  visible={drawMode}
                  workspaceId={User.workspaceData?.currentWorkspace?.id ?? 0}
                  token={User.authUser?.token ?? ""}
                  userId={User.workspaceData?.currentWorkspace?.owner_id ?? 0}
                />
              </main>

              {/* Right panel — Available Tasks + Task Details */}
              {isCreator && (
                <>
                  {/* Mobile backdrop */}
                  <div
                    className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${showRightPanel ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    onClick={() => setShowRightPanel(false)}
                  />
                  {/* Panel */}
                  <aside
                    className={`
                      flex flex-col bg-[#0f172a] border-l border-[#334155] overflow-hidden flex-shrink-0
                      transition-all duration-300
                      fixed top-0 right-0 h-full z-50 w-72
                      ${showRightPanel ? "translate-x-0" : "translate-x-full"}
                      md:relative md:top-auto md:bottom-auto md:h-auto md:z-auto md:translate-x-0
                      ${showRightPanel ? "md:w-72" : "md:w-0 md:overflow-hidden"}
                    `}
                  >
                    {/* Available Tasks */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-b border-[#334155]">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155] flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Tasks</p>
                          {availableTasks.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-ev-yellow/10 text-ev-yellow text-[10px] rounded-md">{availableTasks.length}</span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowRightPanel(false)}
                          className="md:hidden w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                        {availableTasks.length > 0 ? (
                          availableTasks.map((task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id, true)}
                              className="flex items-center gap-3 p-2.5 bg-[#1e293b] border border-[#334155] rounded-xl cursor-grab hover:border-ev-yellow/40 transition-all group active:scale-95"
                            >
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#334155] flex-shrink-0 flex items-center justify-center">
                                <Image
                                  src={task.image || (task.type === "defaultTask" ? "/outlet.png" : "/problem.png")}
                                  alt={task.label}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-xs text-slate-300 group-hover:text-slate-100 truncate flex-1">{task.label}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <ClipboardList className="w-8 h-8 text-slate-700" />
                            <p className="text-xs text-slate-500 text-center">
                              No tasks yet.<br />Use &quot;Add Task&quot; to create some.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Task Details */}
                    <div className="flex-[0_0_40%] min-h-0 flex flex-col overflow-hidden">
                      <div className="flex items-center px-4 py-3 border-b border-[#334155] flex-shrink-0">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Details</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3">
                        {selectedTask ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-100">{selectedTask.label}</p>
                            {selectedTask.description && (
                              <p className="text-xs text-slate-400">{selectedTask.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {selectedTask.importance && (
                                <span className={`px-2 py-0.5 text-[10px] rounded-md border font-medium ${
                                  selectedTask.importance === "HIGH"
                                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                                    : selectedTask.importance === "MEDIUM"
                                    ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                                    : "bg-green-500/15 text-green-400 border-green-500/30"
                                }`}>
                                  {selectedTask.importance}
                                </span>
                              )}
                              {selectedTask.category && (
                                <span className="px-2 py-0.5 text-[10px] rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                  {selectedTask.category}
                                </span>
                              )}
                            </div>
                            {selectedTask.assignee_email && (
                              <p className="text-xs text-slate-400">
                                <span className="text-slate-500">Assignee: </span>
                                {selectedTask.assignee_email}
                              </p>
                            )}
                            {selectedTask.image && (
                              <Image
                                src={selectedTask.image}
                                alt="Task image"
                                width={200}
                                height={120}
                                className="rounded-lg mt-1 object-cover w-full"
                              />
                            )}
                            <p className="text-[10px] text-slate-600">
                              Position: {selectedTask.position.map((v) => Number(v).toFixed(4)).join(", ")}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 text-center py-6">
                            Click a task on the map to see its details
                          </p>
                        )}
                      </div>
                    </div>
                  </aside>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default function EmployeesOverview() {
  return <MapEditor />;
}
