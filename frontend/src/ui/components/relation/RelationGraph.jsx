import React, { useState } from 'react';
import './RelationGraph.css';

const RelationGraph = ({ relations, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Простая визуализация без сложной графики
  const renderSimpleGraph = () => {
    if (relations.length === 0) {
      return <div className="no-relations">Нет связей для отображения</div>;
    }
    
    return (
      <div className="simple-graph">
        {relations.map((rel, index) => (
          <div key={index} className="graph-node">
            <div className="node-icon" style={{ color: rel.type.color }}>
              {rel.type.icon}
            </div>
            <div className="node-content">
              <div className="node-type">{rel.type.label}</div>
              <div className="node-description">"{rel.description}"</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="simple-relation-graph">
      <div className="graph-header">
        <h3>Связи ({relations.length})</h3>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        renderSimpleGraph()
      )}
      
      <div className="graph-info">
        <div className="info-item">
          Всего связей: {relations.length}
        </div>
      </div>
    </div>
  );
};

export default RelationGraph;