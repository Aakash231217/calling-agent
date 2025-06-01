import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAgentsData } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, List, Edit, ExternalLink, Bot } from 'lucide-react';

export const Agents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Define the interface for agent data structure
  interface AgentsResponse {
    agents: any[];
  }

  const { data: agentsResponse, isLoading, error } = useQuery<unknown, unknown, { data: AgentsResponse; status: boolean }>({
    queryKey: ['agents'],
    queryFn: () => fetchAgentsData({ page: 1, offset: 50 }),
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Agents</h1>
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Agents</h1>
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
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
      </div>
    );
  }

  // Access the agents data array
  const agents = agentsResponse?.data?.agents || [];

  // Filter agents based on search term
  const filteredAgents = agents.length > 0
    ? agents.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
      </div>
      
      <Card className="mb-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search Agents
          </CardTitle>
          <CardDescription>Find agents by name or description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search agents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-blue-600" />
            Agent List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAgents.map((agent) => (
                <div key={agent._id} className="border rounded-md hover:bg-gray-50 transition-colors p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{agent.name}</h3>
                      {agent.description && (
                        <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {agent.language?.enabled && (
                          <Badge variant="outline" className="bg-blue-50">
                            Language: {agent.language.enabled.toUpperCase()}
                          </Badge>
                        )}
                        {agent.language?.synthesizer?.voiceConfig?.model && (
                          <Badge variant="outline" className="bg-purple-50">
                            Voice: {agent.language.synthesizer.voiceConfig.model.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4">
                        <Link to={`/agents/${agent._id}`}>
                          <Button variant="outline" className="w-full gap-1">
                            <Edit className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No agents match your search criteria' : 'No agents found.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
