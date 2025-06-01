import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAgentsData } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { List, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const AgentList = () => {
  // Define the interface for agent data structure
  interface AgentsResponse {
    agents: any[];
  }

  const { data: agentsResponse, isLoading, error } = useQuery<unknown, unknown, { data: AgentsResponse; status: boolean }>({
    queryKey: ['agents'],
    queryFn: () => fetchAgentsData({ page: 1, offset: 10 }),
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Agent List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 p-3 border rounded-md">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <List className="h-5 w-5" />
            Agent List - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load agent data</p>
          <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  // Access the agents data correctly from the response
  const agents = agentsResponse?.data?.agents || [];

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mt-6 hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5 text-blue-600" />
          Agent List
        </CardTitle>
      </CardHeader>
      <CardContent>
        {agents && agents.length > 0 ? (
          <ul className="space-y-3">
            {agents.map((agent) => (
              <li key={agent._id} className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">{agent.name}</h3>
                    {agent.description && (
                      <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                    )}
                  </div>
                  <Link to={`/agents/${agent._id}`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.language?.enabled && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Language: {agent.language.enabled.toUpperCase()}
                    </Badge>
                  )}
                  {agent.language?.synthesizer?.voiceConfig?.model && (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      Voice: {agent.language.synthesizer.voiceConfig.model.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600">No agents found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
