import React, { useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles.css';

const Alert = ({ message }) => {
    return (
        <div className="alert">
            {message}
        </div>
    );
};

const Holon = ({
    node,
    onSelectNode,
    isSelected,
    setSelectedHolonIds,
    hoveredHolonId,
    setHoveredHolonId,
    showAddSign,
    setShowAddSign,
    toggleAddMessage,
    handleAddClick,
    connections
}) => {
    const handleNodeClick = () => {
        onSelectNode(node);
        setShowAddSign(true);
        toggleAddMessage(false); // This line toggles the add message display off when a node is clicked.
    };

    const handleMouseEnter = () => {
        setHoveredHolonId(node.id);
    };

    const handleMouseLeave = () => {
        setHoveredHolonId(null);
    };

    const selected = isSelected(node);
    const isHovered = hoveredHolonId === node.id && !selected;

    return (
        <TreeNode
            label={
                <div
                    className={`tree-label ${selected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                    onClick={handleNodeClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="name">{node.name}</div>
                    {showAddSign && (
                        <div className="buttons">
                            <Button variant="primary" size="sm" onClick={(e) => handleAddClick(e, node)}>
                                <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        </div>
                    )}
                </div>
            }
        >
            {node.children &&
                node.children.map((child) => (
                    <Holon
                        key={child.id}
                        node={child}
                        onSelectNode={onSelectNode}
                        isSelected={isSelected}
                        setSelectedHolonIds={setSelectedHolonIds}
                        hoveredHolonId={hoveredHolonId}
                        setHoveredHolonId={setHoveredHolonId}
                        showAddSign={showAddSign}
                        setShowAddSign={setShowAddSign}
                        toggleAddMessage={toggleAddMessage}
                        handleAddClick={handleAddClick}
                        connections={connections}
                    />
                ))}
        </TreeNode>
    );
};

const CommunicationPage = () => {
    const initialNodes = {
        id: 'root',
        name: 'Information System',
        description: 'An organized combination of people, hardware, software, communication networks, and data resources that collects, transforms, and disseminates information in an organization.',
        children: [
            {
                id: 'Stakeholder',
                name: 'Stakeholder',
                description: 'Refers to any individual, group, or organization that has an interest or concern in the system, its development, implementation, or outcomes.',
                children: [],
            },
            {
                id: 'Infrastructure',
                name: 'Infrastructure',
                description: 'Refers to the fundamental physical and organizational structures, facilities, and services required for the operation of an information system.',
                children: [],
            }
        ],
    };

    const [nodes, setNodes] = useState(initialNodes);
    const [selectedHolonIds, setSelectedHolonIds] = useState([]);
    const [hoveredHolonId, setHoveredHolonId] = useState(null);
    const [showAddSign, setShowAddSign] = useState(true);
    const [showAddMessage, setShowAddMessage] = useState(false);
    const [connections, setConnections] = useState([]);

    const toggleAddMessage = (value) => {
        setShowAddMessage(value);
    };

    const handleSelectNode = (node) => {
        setSelectedHolonIds([node.id]);
        setShowAddSign(true);
        setShowAddMessage(false); // This line hides the message when any node is selected.
    };

    const isSelected = (node) => selectedHolonIds.includes(node.id);

    const handleAddClick = (e, node) => {
        e.stopPropagation();
        if (!connections.some(conn => conn.from === node)) {
            toggleAddMessage(true);
            setShowAddSign(false);
        } else {
            toggleAddMessage(false);
            setShowAddSign(true);
        }
        setConnections([...connections, { from: node }]);
    };

    return (
        <div className="app-container">
            <div className="content-area">
                <Tree lineWidth={"2px"} lineColor={"blue"} lineBorderRadius={"5px"} lineStyle={"dashed"}>
                    <Holon
                        node={nodes}
                        onSelectNode={handleSelectNode}
                        isSelected={isSelected}
                        setSelectedHolonIds={setSelectedHolonIds}
                        hoveredHolonId={hoveredHolonId}
                        setHoveredHolonId={setHoveredHolonId}
                        showAddSign={showAddSign}
                        setShowAddSign={setShowAddSign}
                        toggleAddMessage={toggleAddMessage}
                        handleAddClick={handleAddClick}
                        connections={connections}
                    />
                </Tree>
            </div>
            {showAddMessage && <Alert message="Click another holon to add an information flow." />}
        </div>
    );
};

export default CommunicationPage;
