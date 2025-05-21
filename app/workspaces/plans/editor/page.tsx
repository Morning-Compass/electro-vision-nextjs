"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import Image from "next/image";
import SearchButton from "@/components/SearchButton";
import Input from "@/components/Input";
import Overlay from "@/components/Overlay";
import useUserContext from "@/ev-contexts/userContextProvider";
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  EdgeChange,
  Connection,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

interface TaskNodeData {
  label: string;
  image?: string | null;
  description?: string;
}

type AppNode = Node<TaskNodeData>;
type AppEdge = Edge;

const initialNodes: AppNode[] = [
  {
    id: "1",
    type: "default",
    position: { x: 50, y: 50 },
    data: { label: "Task 1 - Drag Me!" },
  },
  {
    id: "2",
    type: "default",
    position: { x: 250, y: 100 },
    data: { label: "Task 2" },
  },
];

const initialEdges: AppEdge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
];

const FlowEditor = () => {
  const { User } = useUserContext();
  // Get the raw value of coverPhoto
  const coverPhotoValue = User.currentWorkspace?.coverPhoto;

  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
  const [nodes, setNodes] = useState<AppNode[]>(initialNodes);
  const [edges, setEdges] = useState<AppEdge[]>(initialEdges);

  const reactFlowInstance = useReactFlow();

  const [newTaskName, setNewTaskName] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [newTaskPhoto, setNewTaskPhoto] = useState<File | null>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const handleOpenOverlay = () => {
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setNewTaskName("");
    setNewTaskDescription("");
    setNewTaskPhoto(null);
  };

  const handleAddTaskFromOverlay = () => {
    if (!newTaskName.trim()) {
      alert("Task name is required.");
      return;
    }
    const newNodeId = `node_${Date.now()}`;
    const newNode: AppNode = {
      id: newNodeId,
      type: "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: newTaskName,
        description: newTaskDescription,
        image: newTaskPhoto ? URL.createObjectURL(newTaskPhoto) : null,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    handleCloseOverlay();
  };

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = `node_${Date.now()}_${type}`;
      const newNode: AppNode = {
        id: newNodeId,
        type,
        position,
        data: {
          label: `${type === "defaultTask" ? "New Outlet" : "New Custom Item"}`,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  ); // Added setNodes dependency

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleRemoveSelected = () => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      const selectedNodeIds = selectedNodes.map((node) => node.id);
      setNodes((nds) => nds.filter((node) => !node.selected));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !selectedNodeIds.includes(edge.source) &&
            !selectedNodeIds.includes(edge.target),
        ),
      );
    } else {
      alert("No tasks selected to remove.");
    }
  };

  // --- Logic to handle SVG string or URL for background ---
  const backgroundStyle: React.CSSProperties = {
    backgroundSize: "contain",
    backgroundPosition: "center",
    minHeight: "500px",
    backgroundImage: 'url("/problem.png")',
  };

  // background-size: cover;
  // background-position: center center;
  // min-height: 500px;
  // background-image: url("/problem.png");

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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewTaskName(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
            placeholder="Task Name..."
          />
          <textarea
            name="textarea"
            value={newTaskDescription}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setNewTaskDescription(e.target.value)
            }
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mc-blue focus:border-transparent outline-none"
            placeholder="Task description (optional)..."
          />
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-lg text-ev-text">Select photo (optional):</p>
            <Input
              name="select_photo_task"
              type="file"
              className="text-ev-text"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
          <aside className="flex flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-60 sticky top-4">
            <h3 className="text-xl font-semibold mb-2 text-ev-text">
              Task Types
            </h3>
            <section
              draggable
              onDragStart={(event: DragEvent<HTMLDivElement>) =>
                handleDragStart(event, "defaultTask")
              }
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
              onDragStart={(event: DragEvent<HTMLDivElement>) =>
                handleDragStart(event, "customTask")
              }
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
                name="change_plan_button"
                type="button"
                className="text-ev-white bg-ev-blue hover:bg-ev-darkblue font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-mc-blue-darker duration-300"
                value="Change Plan"
              />
              <SearchButton />
            </section>
            <section
              className="flex-grow h-full rounded-2xl overflow-hidden shadow-lg relative"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                proOptions={{ hideAttribution: true }} // Hides the React Flow attribution for a cleaner look
              >
                <Controls className="!bottom-4 !left-4" />
                <Background style={backgroundStyle} />
              </ReactFlow>
            </section>
          </main>
          <aside className="flex flex-col gap-4 h-full bg-ev-primary p-4 rounded-xl shadow-lg max-h-[calc(100vh-var(--navbar-height,64px)-var(--footer-height,50px)-3rem)] overflow-y-auto w-72 sticky top-4">
            <h3 className="text-xl font-semibold mb-2 text-ev-text">
              Task Details
            </h3>
            {nodes.find((node) => node.selected) ? (
              <section className="p-3 border border-gray-200 rounded-lg text-sm text-ev-text space-y-2">
                <p>
                  <strong>ID:</strong> {nodes.find((node) => node.selected)!.id}
                </p>
                <p>
                  <strong>Label:</strong>{" "}
                  {nodes.find((node) => node.selected)!.data.label}
                </p>
                {nodes.find((node) => node.selected)!.data.description && (
                  <p>
                    <strong>Description:</strong>{" "}
                    {nodes.find((node) => node.selected)!.data.description}
                  </p>
                )}
                {nodes.find((node) => node.selected)!.data.image && (
                  <Image
                    src={nodes.find((node) => node.selected)!.data.image!}
                    alt="Task image"
                    width={64}
                    height={64}
                    className="rounded mt-2 object-cover"
                  />
                )}
              </section>
            ) : (
              <section className="p-3 border border-gray-200 rounded-md text-sm text-ev-text">
                Select a task on the map to see its details.
              </section>
            )}
            {/* Note: This image here is likely decorative for the sidebar, not the background */}
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
};

export default function EmployeesOverview() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
