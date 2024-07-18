import React, { useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import "./styles.css";
import CommunicationPage from "./CommunicationPage";
import CommunicationReactFlow from "./CommunicationReactFlow";
import InfrastructureReactFlow from "./InfraStructureReactFlow";

import ReactFlow, { addEdge, useNodesState, useEdgesState } from "reactflow";

const initNodes = [
  {
    id: "1a",
    type: "customNode",
    data: {
      label: "Information System",
      description:
        "An information system is an organized combination of people, hardware, software, communication networks, and data resources that collects, transforms, and disseminates information in an organization.",
    },
    position: { x: 250, y: 5 },
  },
  {
    id: "2a",
    type: "customNode",
    data: {
      label: "Stakeholder",
      description:
        "A stakeholder refers to any individual, group, or organization that has an interest or concern in the system, its development, implementation, or outcomes. These stakeholders can be internal or external to the organization implementing the information system. Understanding and managing stakeholders is crucial for the success of an information system project.",
    },
    position: { x: 100, y: 120 },
  },
  {
    id: "3a",
    type: "customNode",
    data: {
      label: "Infrastructure",
      description:
        "Infrastructure in the context of information systems refers to the fundamental physical and organizational structures, facilities, and services required for the operation of an information system. This includes hardware, software, networking components, data centers, and the personnel that maintain and manage the system. Effective infrastructure supports the smooth and efficient collection, storage, processing, and dissemination of information.",
    },
    position: { x: 400, y: 120 },
  },
];

const initEdges = [
  { id: "e1-2", source: "1a", target: "2a" },
  { id: "e1-3", source: "1a", target: "3a" },
];

const Holon = ({
  node,
  onAddChild,
  onRemoveNode,
  onSelectNode,
  isSelected,
}) => {
  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  const selected = isSelected(node);

  return (
    <TreeNode
      label={
        <div
          className={`p-2 mb-2 border ${
            selected ? "tree-label selected" : "tree-label"
          } rounded`}
          onClick={() => onSelectNode(node)}
        >
          <div>{node.name}</div>
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              size="sm"
              className="me-1"
              onClick={(e) => handleActionClick(e, () => onAddChild(node))}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => handleActionClick(e, () => onRemoveNode(node.id))}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        </div>
      }
    >
      {node.children &&
        node.children.map((child) => (
          <Holon
            key={child.id}
            node={child}
            onAddChild={onAddChild}
            onRemoveNode={onRemoveNode}
            onSelectNode={onSelectNode}
            isSelected={isSelected}
          />
        ))}
    </TreeNode>
  );
};

const App = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-start align-items-center p-3 bg-light shadow-sm">
        <div
          className={`step me-3 ${activeStep === 1 ? "active" : ""}`}
          onClick={() => setActiveStep(1)}
        >
          <div
            className={`step-circle text-white rounded-circle d-flex justify-content-center align-items-center ${
              activeStep === 1 ? "bg-primary" : "bg-secondary"
            }`}
            style={{ width: "30px", height: "30px" }}
          >
            1
          </div>
          <div
            className={`ms-2 fw-bold ${activeStep === 1 ? "text-primary" : ""}`}
          >
            Structure
          </div>
        </div>
        <div
          className={`step ${activeStep === 2 ? "active" : ""}`}
          onClick={() => setActiveStep(2)}
        >
          <div
            className={`step-circle text-white rounded-circle d-flex justify-content-center align-items-center ${
              activeStep === 2 ? "bg-primary" : "bg-secondary"
            }`}
            style={{ width: "30px", height: "30px" }}
          >
            2
          </div>
          <div
            className={`ms-2 fw-bold ${activeStep === 2 ? "text-primary" : ""}`}
          >
            Communication
          </div>
        </div>
      </div>
      <div className="row p-3">
        <div className="col-md-8">
          {activeStep === 1 ? (
            <InfrastructureReactFlow
              initNodes={initNodes}
              initEdges={initEdges}
              nodes={nodes}
              setNodes={setNodes}
              onNodesChange={onNodesChange}
              edges={edges}
              setEdges={setEdges}
              onEdgesChange={onEdgesChange}
            />
          ) : (
            <CommunicationReactFlow
              initNodes={initNodes}
              initEdges={initEdges}
              nodes={nodes}
              setNodes={setNodes}
              onNodesChange={onNodesChange}
              edges={edges}
              setEdges={setEdges}
              onEdgesChange={onEdgesChange}
            /> // Properly integrate the CommunicationPage component
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
