This repository contains a React application that leverages the reactflow library to create interactive flow diagrams for both communication and infrastructure structures. The application allows users to create, modify, and visualize nodes and edges, representing different entities and their relationships.

Features

Communication Flow Interactive Nodes: Users can click on nodes to view and edit their details, including labels and descriptions.
Information Flows: Users can define and visualize information flows between nodes. The application supports adding, deleting, and exporting/importing information flows.

Path Visualization: The application highlights the path between selected nodes, making it easy to understand the flow of information.

Export/Import: Users can export the current information flows as a JSON file and import previously saved flows.

Infrastructure Flow Hierarchical Structure: Users can create hierarchical structures by adding parent and child nodes.
Node Management: Nodes can be added, deleted, and edited. The application supports adding both child and parent nodes to existing nodes.

Edge Management: Users can delete edges between nodes to modify the structure.

User Interface Step-by-Step Navigation: The application provides a step-by-step interface to switch between the "Structure" and "Communication" views.
Modal Dialogs: Modal dialogs are used for adding new nodes and displaying alerts.

Bootstrap Styling: The application uses Bootstrap for a clean and responsive user interface.

Installation To run this application locally, follow these steps:

Clone the repository:

git clone https://github.com/your-username/communication-infrastructure-reactflow.git cd communication-infrastructure-reactflow

Install dependencies: npm install

Run the application: npm start

Open the application: Open your browser and navigate to http://localhost:3000.

Usage Communication Flow Add Information Flow: Click on the "Add Information Flow" button to start defining information flows between nodes. Select a source node and then a destination node to create a flow.

Export/Import: Use the "Export Information Flows" button to export the current flows as a JSON file. Use the "Import Information Flows" button to import flows from a JSON file.

Show Flows: Use the "Show All Flow" and "Selected Holon" buttons to visualize the information flows on the graph.

Infrastructure Flow Add Node: Click on the "Add Node" button to open a modal where you can add a new node. You can choose to add a child node or a parent node.

Edit Node: Click on any node to view and edit its details, including the label and description.

Delete Node/Edge: Use the delete buttons to remove nodes or edges from the graph.

Code Structure CommunicationReactFlow.js: Contains the logic for the communication flow, including node and edge management, information flow handling, and export/import functionality.

InfrastructureReactFlow.js: Contains the logic for the infrastructure flow, including hierarchical node management and edge handling.

App.js: The main application component that handles the navigation between the "Structure" and "Communication" views.

CustomNode.js: A custom node component used in the flow diagrams.

styles.css: Custom styles for the application.

Dependencies React: A JavaScript library for building user interfaces.

ReactFlow: A library for building interactive flow diagrams.

Bootstrap: A CSS framework for responsive design.

React Modal: A library for creating modal dialogs.

FontAwesome: A library for icons.

