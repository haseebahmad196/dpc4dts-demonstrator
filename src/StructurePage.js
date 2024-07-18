import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import './styles.css';

const Holon = ({ node, onAddChild, onRemoveNode, onSelectNode, isSelected }) => {
    const handleActionClick = (e, action) => {
        e.stopPropagation();
        action();
    };

    const selected = isSelected(node);

    return (
        <TreeNode label={
            <div className={`p-2 mb-2 border ${selected ? 'tree-label selected' : 'tree-label'} rounded`} onClick={() => onSelectNode(node)}>
                <div>{node.name}</div>
                <div className="d-flex justify-content-end">
                    <Button variant="primary" size="sm" className="me-1" onClick={(e) => handleActionClick(e, () => onAddChild(node, true))}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                    <Button variant="danger" size="sm" onClick={(e) => handleActionClick(e, () => onRemoveNode(node.id))}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            </div>
        }>
            {node.children && node.children.map(child => (
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

const StructurePage = ({ nodes, onAddChild, onRemoveNode, onSelectNode, isSelected, addNewRoot }) => {
    return (
        <div>
            <label
                tabIndex="0"
                className={`btn btn-outline-primary ${isSelected(nodes) ? 'selected' : ''}`}
                onClick={addNewRoot}
            >
                Parent Node
            </label>
            <Tree lineWidth={"2px"} lineColor={"blue"} lineBorderRadius={"5px"} lineStyle={"dashed"}>
                <Holon
                    node={nodes}
                    onAddChild={onAddChild}
                    onRemoveNode={onRemoveNode}
                    onSelectNode={onSelectNode}
                    isSelected={(node) => isSelected && node.id === isSelected.id}
                />
            </Tree>
        </div>
    );
};

export default StructurePage;
