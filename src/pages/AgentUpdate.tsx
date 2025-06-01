import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentUpdateForm } from '@/components/AgentUpdateForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const AgentUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>No agent ID specified. Please select an agent to update.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/agents')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Button>
      </div>
      <AgentUpdateForm 
        agentId={id}
        onSuccess={() => {
          // Optional: You can add a toast notification here
        }}
      />
    </div>
  );
};
