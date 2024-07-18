import React, { useCallback, useState } from "react";
import ReactFlow, { addEdge, useNodesState, useEdgesState } from "reactflow";
import Modal from "react-modal";
import "reactflow/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import CustomNodeFlow from "./CustomNodeFlow";

const nodeTypes = {
  customNode: CustomNodeFlow,
};

const initNodes = [
  {
    id: "1a",
    type: "customNode",
    data: { label: "Node 1" },
    position: { x: 250, y: 5 },
  },
  {
    id: "2a",
    type: "customNode",
    data: { label: "Node 2" },
    position: { x: 100, y: 120 },
  },
  {
    id: "3a",
    type: "customNode",
    data: { label: "Node 3" },
    position: { x: 400, y: 120 },
  },
];

const initEdges = [
  { id: "e1-2", source: "1a", target: "2a" },
  { id: "e1-3", source: "1a", target: "3a" },
];

const fitViewOptions = { padding: 0.5 };

Modal.setAppElement("#root");

function CommunicationReactFlow(props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges);
  const [parentNodeId, setParentNodeId] = useState("");
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceNode, setSourceNode] = useState(null);
  const [destinationNode, setDestinationNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const findPath = (sourceId, targetId) => {
    const visited = new Set();
    const queue = [[sourceId]];

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === targetId) {
        return path;
      }

      if (!visited.has(node)) {
        visited.add(node);
        edges
          .filter((edge) => edge.source === node || edge.target === node)
          .forEach((edge) => {
            const nextNode = edge.source === node ? edge.target : edge.source;
            queue.push([...path, nextNode]);
          });
      }
    }
    return [];
  };

  const handleNodeClick = (id) => {
    let node = nodes.find((element) => element.id == id);
    console.log(id);
    console.log(props.nodes);
    if (!sourceNode) {
      setSelectedNode(null);
      setSourceNode(node);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, style: { border: "2px solid blue" } } : n
        )
      );
    } else if (!destinationNode) {
      setDestinationNode(node);
      setSelectedNode(node);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, style: { border: "2px solid green" } } : n
        )
      );
      const path = findPath(sourceNode.id, node.id);
      setEdges((eds) =>
        eds.map((edge) => {
          const isInPath =
            path.includes(edge.source) && path.includes(edge.target);
          return {
            ...edge,
            animated: isInPath,
            style: { stroke: isInPath ? "green" : "black" },
          };
        })
      );
    } else {
      setSourceNode(node);
      setDestinationNode(null);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, style: { border: "2px solid blue" } }
            : { ...n, style: { border: "none" } }
        )
      );
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          animated: false,
          style: { stroke: "black" },
        }))
      );
    }
  };

  return (
    <div
      className="container-fluid"
      style={{ display: "flex", height: "100vh" }}
    >
      <div className="col-9" style={{ height: "100%" }}>
        <div className="mb-3">
          <h3>Add Node</h3>
        </div>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              nodeClicked: handleNodeClick,
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={fitViewOptions}
          style={{ width: "100%", height: "90%" }}
          // onNodeClick={handleNodeClick}
        />
      </div>
      <div
        className="col-3"
        style={{ padding: "10px", borderLeft: "1px solid #ccc" }}
      >
        {selectedNode ? (
          <>
            <h3>Holon Details</h3>
            <div className="form-group">
              <label htmlFor="nameofNode">Name</label>
              <input
                type="text"
                id="nameofNode"
                className="form-control"
                value={selectedNode.data.label}
                onChange={(e) =>
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id
                        ? {
                            ...node,
                            data: { ...node.data, label: e.target.value },
                          }
                        : node
                    )
                  )
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="nodeDescription">Description</label>
              <textarea
                id="nodeDescription"
                className="form-control"
                placeholder="An example description..."
                value={selectedNode.data.description}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nodeInfoFlows">Information Flows</label>
              <input
                type="text"
                id="nodeInfoFlows"
                className="form-control"
                value={selectedNode.data.label}
                readOnly
              />
            </div>
          </>
        ) : (
          <div>No Selection</div>
        )}
      </div>
      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <div className="modal-header">
          <h5 className="modal-title">Add Node</h5>
          <button
            type="button"
            className="close"
            onClick={() => setIsModalOpen(false)}
          >
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="newNodeLabel">New Node Label</label>
            <input
              type="text"
              id="newNodeLabel"
              className="form-control"
              placeholder="New Node Label"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CommunicationReactFlow;
