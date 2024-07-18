import React from "react";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data, id }) => {
  console.log(data);
  console.log(id);
  return (
    <div
      className="card text-center"
      id={id}
      style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}
    >
      <div className="card-body">
        <h5 className="card-title">{data.label}</h5>
        <div>
          {" "}
          {data?.onAdd ? (
            <>
              <button
                className="btn btn-success btn-sm nodrag"
                onClick={() => data.onAdd(id)}
                style={{ margin: "5px" }}
              >
                +
              </button>
              <button
                className="btn btn-danger btn-sm nodrag"
                onClick={() => data.onDelete(id)}
                style={{ margin: "5px" }}
              >
                -
              </button>
            </>
          ) : (
            <></>
          )}
        </div>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
};

export default CustomNode;
