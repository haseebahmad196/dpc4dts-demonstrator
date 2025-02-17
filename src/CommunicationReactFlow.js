import React, { useCallback,  useState } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import Modal from "react-modal";
import "reactflow/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import CustomNodeFlow from "./CustomNodeFlow";

const nodeTypes = {
  customNode: CustomNodeFlow,
};

const fitViewOptions = { padding: 0.5 };

Modal.setAppElement("#root");

function CommunicationReactFlow(props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges);
  const [sourceNode, setSourceNode] = useState(null);
  const [destinationNode, setDestinationNode] = useState();
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedInformationFlow, setSelectedInformationFlow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enableInformationFlow, setEnableInformationFlow] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [disableAdd] = useState(false);
  const [resetFlow, setResetFlow] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false); // State for alert modal visibility
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message

  const [informationFlows, setInformationFlows] = useState([]);
  const [selectedInformationFlows, setSelectedInformationFlows] = useState([]);
  const [selectedFlowShow, setSelectedFlowShow] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Export the information flows as a JSON file
  const exportInformationFlows = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(informationFlows));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "informationFlows.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import the information flows from a JSON file
  const importInformationFlows = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const importedFlows = JSON.parse(e.target.result);

        if (Array.isArray(importedFlows)) {
          console.log(importedFlows);
          console.log(informationFlows);
          // Convert the imported flows into nodes and update the state
          setInformationFlows(
            importedFlows.map(([sourceNode, destinationNode]) => {
              return [
                nodes.find((node) => node.id === sourceNode.id) || sourceNode,
                nodes.find((node) => node.id === destinationNode.id) ||
                  destinationNode,
              ];
            })
          );
          alert("Information Flows loaded successfully.");
        } else {
          alert("Invalid JSON format.");
        }
      } catch (error) {
        alert("Failed to load the JSON file. Please check the file format.");
      }
    };

    if (event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0]);
    }
  };

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

  const handleNodeClick = (event, nodeData) => {
    const clickedNode = nodes.find((n) => n.id === nodeData.id) || nodeData;
    setSelectedNode(clickedNode);
    const selectedInformationFlow = informationFlows
      ?.find((flow) => flow.find((flowItem) => flowItem?.id === nodeData.id))
      ?.find((infoFlow) => infoFlow?.id === nodeData.id);
    setSelectedInformationFlow(selectedInformationFlow);

    if (enableInformationFlow) {
      setResetFlow(false);
      if (!sourceNode) {
        setSourceNode(clickedNode);
        setNodes((nds) =>
          nds.map((n) =>
            n.id === clickedNode.id ? { ...n, style: { border: "2px solid blue" } } : n
          )
        );
      } else if (sourceNode.id !== clickedNode.id) {
        const levelTolerance = 15;
        if (Math.abs(sourceNode.position.y - clickedNode.position.y) > levelTolerance) {
          // Show Bootstrap-styled alert modal
          setAlertMessage("Source and destination nodes must be on the same level.");
          setIsAlertModalOpen(true);
          return;
        }

        const path = findPath(sourceNode.id, clickedNode.id);
        setEdges((eds) =>
          eds.map((edge) => {
            const isInPath =
              path.includes(edge.source) && path.includes(edge.target);
            return {
              ...edge,
              animated:
                edge?.style?.stroke === "green" || isInPath ? true : false,
              style: {
                stroke:
                  edge?.style?.stroke === "green"
                    ? "green"
                    : isInPath
                    ? "green"
                    : "black",
              },
              markerEnd: {
                type:
                  edge?.style?.stroke === "green" || isInPath
                    ? MarkerType.ArrowClosed
                    : null,
                color: "green",
                width: 20,
                height: 20,
              },
            };
          })
        );

        setDestinationNode(clickedNode);
        let informationFl = [...informationFlows];

        const isDuplicate = informationFl.some(
          (flow) => flow[0].id === sourceNode.id && flow[1].id === clickedNode.id
        );

        if (!isDuplicate) {
          informationFl.push([sourceNode, clickedNode]);
          setInformationFlows(informationFl);
        }
        setNodes((nds) =>
          nds.map((n) =>
            n.id === clickedNode.id
              ? { ...n, style: { border: "2px solid green" } }
              : n
          )
        );
        setTimeout(resetSelection, 1000);
      }
    }
  };

  const showInformationFlowOnTheGraphs = () => {
    informationFlows.forEach((flow) => {
      const [sourceNode, destinationNode] = flow;
      showOneFlowOnGraph(sourceNode, destinationNode);
    });

    setSelectedFlowShow(false);
  };

  const showSelectedHolonFlowOnTheGraphs = () => {
    resetGraphs();
    let selectedLabel = selectedNode?.data?.label;
    informationFlows.forEach((flow) => {
      let flowLabel0 = flow[0].data?.label;
      let flowLabel1 = flow[1].data?.label;
      if (flowLabel0 === selectedLabel || flowLabel1 === selectedLabel) {
        const [sourceNode, destinationNode] = flow;
        showOneFlowOnGraph(sourceNode, destinationNode);
      }
    });
    let newInformationFlows = [];
    informationFlows.forEach((flow) => {
      let flowLabel0 = flow[0].data?.label;
      let flowLabel1 = flow[1].data?.label;
      if (flowLabel0 === selectedLabel || flowLabel1 === selectedLabel) {
        newInformationFlows.push(flow);
      }
    });
    setSelectedInformationFlows(newInformationFlows);
    setSelectedFlowShow(true);
  };

  const showOneFlowOnGraph = (sourceNode, destinationNode) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === sourceNode.id
          ? { ...n, style: { border: "2px solid blue" } }
          : n.id === destinationNode.id
          ? { ...n, style: { border: "2px solid green" } }
          : n
      )
    );

    const path = findPath(sourceNode.id, destinationNode.id);

    if (!path || path.length === 0) {
      console.error("No path found between the selected nodes.");
      return;
    }

    setEdges((eds) =>
      eds.map((edge) => {
        const isInPath =
          path.includes(edge.source) && path.includes(edge.target);

        const isForwardDirection =
          edge.source === path[0] && edge.target === path[1];
        

        return {
          ...edge,
          animated: isInPath ? true : edge.animated,
          style: {
            ...edge.style,
            stroke: isInPath ? "green" : edge.style?.stroke,
            strokeDasharray: isInPath ? "5,5" : edge.style?.strokeDasharray,
          },
          markerEnd: isInPath
            ? {
                type: MarkerType.ArrowClosed,
                color: "green",
                orient: isForwardDirection ? "auto" : "auto-start-reverse",
              }
            : edge.markerEnd,
        };
      })
    );
  };

  const resetSelection = () => {
    setEnableInformationFlow(!enableInformationFlow);
    if (enableInformationFlow) {
      setResetFlow(true);
      setSourceNode(null);
      setDestinationNode(null);
      setNodes((nds) => nds.map((n) => ({ ...n, style: { border: "none" } })));
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          animated: false,
          style: { stroke: "black" },
        }))
      );
    }
  };

  const resetGraphs = () => {
    setNodes((nds) => nds.map((n) => ({ ...n, style: { border: "none" } })));
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: false,
        style: { stroke: "black" },
      }))
    );

    setSelectedFlowShow(false);
  };

  return (
    <div
      className="container-fluid"
      style={{ display: "flex", height: "100vh", width: "98vw" }}
    >
      <div className="col-8" style={{ height: "100%" }}>
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ position: "absolute", top: -88, right: "-23vw" }}
        >
          <button className={"btn btn-success"} onClick={resetSelection}>
            Add Information Flow
          </button>
          {informationFlows.length > 0 && (
            <button
              className={"btn btn-primary ml-2"}
              onClick={exportInformationFlows}
            >
              Export Information Flows
            </button>
          )}

          <input
            type="file"
            accept=".json"
            onChange={importInformationFlows}
            style={{ display: "none" }}
            id="uploadFile"
          />
          <label htmlFor="uploadFile" className="btn btn-secondary ml-2 mt-2">
            Import Information Flows
          </label>
        </div>

        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              disable: disableAdd,
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={fitViewOptions}
          style={{ width: "100%", height: "90%" }}
          onNodeClick={handleNodeClick}
          onPaneClick={() => setSelectedNode(null)}
        />
      </div>
      {sourceNode && destinationNode == null ? (
        <div style={{ position: "fixed", top: "90%", left: "20%", fontSize: "20px" }}>
          <div className="mt-3 alert alert-success">
            Select the Destination Node
          </div>
        </div>
      ) : (
        ""
      )}
      {resetFlow && enableInformationFlow ? (
        <div style={{ position: "fixed", top: "90%", left: "20%", fontSize: "20px" }}>
          <div className="mt-3 alert alert-success">Select the Source Node</div>
        </div>
      ) : (
        ""
      )}
      <div
        className="col-4"
        style={{ padding: "10px", borderLeft: "1px solid #ccc" }}
      >
        {selectedNode ? (
          <div className="mr-3">
            <div className="border border-dark p-4">
              <h4>Holon Details</h4>
              <div className="form-group mb-3">
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
              <div className="form-group mb-3">
                <label htmlFor="nodeDescription">Description</label>
                <textarea
                  id="nodeDescription"
                  className="form-control"
                  style={{ height: "200px", width: "100%" }}
                  placeholder="An example description..."
                  value={selectedNode.data.description || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? {
                              ...node,
                              data: {
                                ...node.data,
                                description: e.target.value,
                              },
                            }
                          : node
                      )
                    )
                  }
                />
              </div>
            </div>
            <div className="border border-dark p-4 my-2">
              <div className="form-group mb-3">
                <h4 className="mb-3">Information Flows</h4>
                <input
                  type="text"
                  id="nodeInfoFlows"
                  className="form-control"
                  value={
                    informationFlows.length > 0
                      ? selectedInformationFlow?.data?.label
                      : selectedNode.data.label
                  }
                  readOnly
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="nodeInfoFlows">
                  Information Flows Description
                </label>
                <textarea
                  type="text"
                  id="nodeInfoFlows"
                  className="form-control"
                  style={{ height: "200px", width: "100%" }}
                  value={
                    informationFlows.length > 0
                      ? selectedInformationFlow?.data?.description
                      : selectedNode.data.description
                  }
                  readOnly
                />
              </div>
              <div>
                {enableInformationFlow && (
                  <p className="lead">Selected Information Flow</p>
                )}
              </div>
              <div>
                <button
                  className={"btn btn-success mx-1"}
                  onClick={() => showInformationFlowOnTheGraphs()}
                >
                  Show All Flow
                </button>
                <button
                  className={"btn btn-success mx-1"}
                  onClick={() => showSelectedHolonFlowOnTheGraphs()}
                >
                  Selected Holon
                </button>
                {informationFlows.length > 0 && (
                  <button
                    className={"btn btn-primary mx-2"}
                    onClick={resetGraphs}
                  >
                    Reset Flow
                  </button>
                )}
              </div>
              {!selectedFlowShow &&
                informationFlows.map((nodePair) => {
                  return (
                    <div
                      className="mt-3 alert alert-success"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      key={`${nodePair[0].id}-${nodePair[1].id}`}
                    >
                      <div>
                        <strong>
                          {nodePair[0].data.label} {"-->"}{" "}
                          {nodePair[1].data.label}
                        </strong>
                      </div>
                      <div style={{ display: "flex", gap: 20 }}>
                        <button
                          className={"btn btn-success"}
                          onClick={() =>
                            showOneFlowOnGraph(nodePair[0], nodePair[1])
                          }
                        >
                          Show Flow
                        </button>
                        <button
                          className={"btn btn-danger"}
                          onClick={() => {
                            const nodeId1 = nodePair[0].id;
                            const nodeId2 = nodePair[1].id;
                            setInformationFlows((flows) =>
                              flows.filter(
                                (pair) =>
                                  !(
                                    pair[0].id === nodeId1 &&
                                    pair[1].id === nodeId2
                                  )
                              )
                            );
                            resetGraphs();
                          }}
                        >
                          Delete Information Flow
                        </button>
                      </div>
                    </div>
                  );
                })}
              {selectedFlowShow &&
                selectedInformationFlows.map((nodePair) => {
                  return (
                    <div
                      className="mt-3 alert alert-success"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      key={`${nodePair[0].id}-${nodePair[1].id}`}
                    >
                      <div>
                        <strong>
                          {nodePair[0].data.label} {"-->"}{" "}
                          {nodePair[1].data.label}
                        </strong> 
                      </div> 
                      <div style={{ display: "flex", gap: 20 }}>
                        <button
                          className={"btn btn-success"}
                          onClick={() =>
                            showOneFlowOnGraph(nodePair[0], nodePair[1])
                          }
                        >
                          Show Flow
                        </button>
                        <button
                          className={"btn btn-danger"}
                          onClick={() => {
                            const nodeId1 = nodePair[0].id;
                            const nodeId2 = nodePair[1].id;
                            setInformationFlows((flows) =>
                              flows.filter(
                                (pair) =>
                                  !(
                                    pair[0].id === nodeId1 &&
                                    pair[1].id === nodeId2
                                  )
                              )
                            );
                            resetGraphs();
                          }}
                        >
                          Delete Information Flow
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
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
          <div className="form-group mb-3">
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setNodes((nds) => [
                ...nds,
                {
                  id: `${nds.length + 1}`,
                  type: "customNode",
                  data: { label: newNodeLabel },
                  position: { x: Math.random() * 400, y: Math.random() * 400 },
                },
              ]);
              setIsModalOpen(false);
              setNewNodeLabel("");
            }}
          >
            Add Node
          </button>
        </div>
      </Modal>

      {/* Bootstrap-styled Alert Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onRequestClose={() => setIsAlertModalOpen(false)}
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
            width: "400px",
            height: "auto",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <div className="modal-header">
          <h5 className="modal-title">Alert</h5>
          <button
            type="button"
            className="close"
            onClick={() => setIsAlertModalOpen(false)}
          >
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <p>{alertMessage}</p>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsAlertModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CommunicationReactFlow;