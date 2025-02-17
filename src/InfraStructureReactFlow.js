import React, { useCallback, useState } from "react";
import ReactFlow, { addEdge, useNodesState, useEdgesState } from "reactflow";
import Modal from "react-modal";
import "reactflow/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import CustomNode from "./CustomNode";

const nodeTypes = {
  customNode: CustomNode,
};

const fitViewOptions = { padding: 0.5 };

Modal.setAppElement("#root");

function InfrastructureReactFlow(props) {
  const [operationType, setOperationType] = useState("addChild");
  const [parentNodeId, setParentNodeId] = useState("");
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onConnect = useCallback(
    (params) => props.setEdges((eds) => addEdge(params, eds)),
    [props.setEdges]
  );

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const handleAddNodeClick = () => {
    setIsModalOpen(true);
  };

  const handleAddNode = () => {
    if (!parentNodeId || !newNodeLabel) return;

    const newNodeId = `node-${props.nodes.length + 1}`;
    const newNode = {
      id: newNodeId,
      type: "customNode",
      data: {
        label: newNodeLabel,
        onAdd: handleAddNodeClick,
        onDelete: handleDeleteNodeClick,
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };

    props.setNodes((nds) => nds.concat(newNode));

    if (operationType === "addChild") {
      props.setEdges((eds) =>
        eds.concat({
          id: `e-${parentNodeId}-${newNodeId}`,
          source: parentNodeId,
          target: newNodeId,
        })
      );
    } else if (operationType === "addParent") {
      props.setEdges((eds) =>
        eds.concat({
          id: `e-${newNodeId}-${parentNodeId}`,
          source: newNodeId,
          target: parentNodeId,
        })
      );
    }

    setParentNodeId("");
    setNewNodeLabel("");
    setIsModalOpen(false);
  };

  const handleDeleteNodeClick = (nodeId) => {
    props.setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    props.setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
  };

  const handleDeleteEdgeClick = (edgeId) => {
    props.setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  };

  const getNodeWithoutParent = () => {
    const childNodes = new Set(props.edges.map((edge) => edge.target));
    return props.nodes.filter((node) => !childNodes.has(node.id));
  };

  return (
    <div
      className="container-fluid"
      style={{ display: "flex", height: "100vh",width:'100vw' }}
    >
      <div className="col-9" style={{ height: "100%" }}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={props.nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onAdd: handleAddNodeClick,
              onDelete: handleDeleteNodeClick,
            },
          }))}
          edges={props.edges}
          onNodesChange={props.onNodesChange}
          onEdgesChange={props.onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={fitViewOptions}
          style={{ width: "100%", height: "90%" }}
          onNodeClick={handleNodeClick}
          edgesUpdatable={false}
        />
      </div>
      <div
        className="col-3"
        style={{ padding: "10px", borderLeft: "1px solid #ccc" }}
      >
        {selectedNode ? (
          <div className="mr-3">
            <h3>Holon Details</h3>
            <div className="form-group">
              <label htmlFor="nodeName1">Name</label>
              <input
                type="text"
                id="nodeName1"
                className="form-control"
                value={selectedNode.data.label}
                onChange={(e) =>
                  props.setNodes((nds) =>
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
                style={{ height: "200px", width: "100%" }}
                className="form-control"
                placeholder="An example description..."
                value={selectedNode.data.description}
              />
            </div>
          </div>
        ) : (
          <div>No Selection</div>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "450px",
            height: "auto",
          },
        }}
      >
        <div className="modal-header">
          <h5 className="modal-title my-2">Add Node</h5>
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
            <label htmlFor="operationTypeSelect">Operation Type</label>
            <select
              id="operationTypeSelect"
              className="form-control"
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
            >
              <option value="addChild">Add Child Node</option>
              <option value="addParent">Add Parent Node</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="parentNodeSelect">
              {operationType === "addChild" ? "Parent Node" : "Child Node"}
            </label>
            <select
              id="parentNodeSelect"
              className="form-control"
              value={parentNodeId}
              onChange={(e) => setParentNodeId(e.target.value)}
            >
              <option value="">Select Node</option>
              {props.nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="newNodeLabel1">New Node Label</label>
            <input
              type="text"
              id="newNodeLabel1"
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
            className="btn btn-primary mx-2"
            onClick={handleAddNode}
          >
            Add Node
          </button>
          <button
            type="button"
            className="btn btn-secondary mx-2"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default InfrastructureReactFlow;
