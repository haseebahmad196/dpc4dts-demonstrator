import React, { useState } from 'react';
import './styles.css';
const Stakeholder = ({ onAdd, onRemove }) => {
    const [childName, setChildName] = useState('');
  
    const handleAddChild = () => {
      if (childName.trim() === '') {
        alert('Please enter a valid name for the child.');
        return;
      }
  
      onAdd(childName);
      setChildName('');
    };
  
    return (
      <div className="holon stakeholder">
        <div className="name">Stakeholder</div>
        <button className="add-button" onClick={handleAddChild}>+</button>
        <button className="remove-button" onClick={onRemove}>x</button>
      </div>
    );
  };