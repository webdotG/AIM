import React from 'react';
import NodeEditor from '@/ui/components/nodes/NodeEditor';
import './CreateNodePage.css';

const CreateNodePage = () => {
  return (
    <div className="create-node-page">
      <NodeEditor />
    </div>
  );
};

export default CreateNodePage;