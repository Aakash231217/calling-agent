import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from './ui/use-toast';
import { Badge } from './ui/badge';
import { Copy, ExternalLink, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { fetchAgentsData, fetchConversationData, makeOutboundCall, checkCallStatus } from '../utils/api';
import { useQuery } from '@tanstack/react-query';

// Agent interface
interface Agent {
  _id: string;
  name: string;
  description?: string;
  language?: {
    enabled: string; // 'en', 'es', etc.
    switching: boolean;
    synthesizer?: {
      voiceConfig?: {
        model: string;
        voiceId?: string;
        gender?: 'male' | 'female';
      };
    };
  };
}

interface OutboundCallerProps {
  initialMode?: 'call' | 'lookup';
}

export function OutboundCaller({ initialMode = 'call' }: OutboundCallerProps = {}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [callLookupId, setCallLookupId] = useState('');
  const [isLookupMode, setIsLookupMode] = useState(initialMode === 'lookup');
  const [callResult, setCallResult] = useState<{
    conversationId?: string;
    callId?: string;
    success: boolean;
    status?: string;
    timestamp?: number;
  } | null>(null);
  
  // Poll for call status updates if we have an active call
  useEffect(() => {
    if (!callResult?.conversationId || callResult.status === 'completed') return;
    
    const checkConversationStatus = async () => {
      try {
        // Only check if we have a conversation ID and the call isn't completed yet
        if (callResult.conversationId && callResult.status !== 'completed') {
          const data = await fetchConversationData(callResult.conversationId);
          
          console.log('Conversation status check:', data);
          
          if (data?.data) {
            // Update call result with the latest status
            setCallResult(prevResult => {
              // Create new status object
              const newStatus = {
                ...prevResult!,
                status: data.data.status,
                callId: data.data.callId || prevResult?.callId,
                // If the call is completed, update the timestamp
                ...(data.data.status === 'completed' && { timestamp: Date.now() })
              };
              
              // If the call is completed, notify the user
              if (data.data.status === 'completed' && prevResult?.status !== 'completed') {
                toast({
                  title: 'Call Completed',
                  description: 'Your call has been completed successfully.',
                });
              }
              
              // Return the updated status object
              return newStatus;
            });
          }
        }
      } catch (error) {
        console.error('Error checking call status:', error);
      }
    };
    
    // Check immediately
    checkConversationStatus();
    
    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(checkConversationStatus, 5000);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, [callResult?.conversationId, callResult?.status]);

  // Define the interface for agent data structure
  interface AgentsResponse {
    agents: Agent[];
  }

  // Fetch agent data using react-query
  const { data: agentsResponse, isLoading: isLoadingAgents, error: agentsError } = useQuery<unknown, unknown, { data: AgentsResponse; status: boolean }>({
    queryKey: ['agents'],
    queryFn: () => fetchAgentsData({ page: 1, offset: 50 }),
  });
  
  // Update local state when agents data is loaded
  useEffect(() => {
    if (agentsResponse?.data?.agents) {
      setAgents(agentsResponse.data.agents);
      console.log(`Found ${agentsResponse.data.agents.length} agents`);
    } else if (agentsResponse?.data && Array.isArray(agentsResponse.data)) {
      // Fallback in case the API returns a direct array
      setAgents(agentsResponse.data);
      console.log(`Found ${agentsResponse.data.length} agents (direct array)`);
    } else {
      console.warn('Unexpected agents data structure:', agentsResponse?.data);
    }
  }, [agentsResponse]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleAgentChange = (value: string) => {
    setSelectedAgentId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !selectedAgentId) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both phone number and select an agent.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await makeOutboundCall({
        agentId: selectedAgentId,
        phoneNumber: formatPhoneNumber(phoneNumber),
      });

      console.log('Call initiation response:', result);

      // Set the call result
      setCallResult({
        success: true,
        conversationId: result.data?.conversationId,
        callId: result.data?.callId,
        status: result.data?.status || 'initiated',
        timestamp: Date.now(),
      });

      toast({
        title: 'Call Initiated',
        description: 'Your outbound call has been successfully initiated.',
      });
      
      // Auto-populate the lookup field with the new conversation ID
      if (result.data?.conversationId) {
        setCallLookupId(result.data.conversationId);
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      console.error('Error initiating outbound call:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to initiate outbound call',
        variant: 'destructive',
      });
      // Clear previous successful call result
      setCallResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Format phone number as user types (optional enhancement)
    return value;
  };

  // Function to look up a call by ID
  const handleLookupCall = async () => {
    if (!callLookupId) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a conversation or call ID to lookup.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to fetch the conversation data to validate it exists
      const conversationData = await fetchConversationData(callLookupId);
      
      if (!conversationData || !conversationData.data) {
        throw new Error('No call data found');
      }
      
      // Set call result
      setCallResult({
        conversationId: callLookupId.trim(),
        callId: conversationData.data.callId,
        success: true,
        status: conversationData.data.status,
        timestamp: Date.now()
      });
      
      // Dispatch a custom event to update the conversation viewer
      const viewEvent = new CustomEvent('view-conversation', { 
        detail: { id: callLookupId.trim() } 
      });
      window.dispatchEvent(viewEvent);
      
      toast({
        title: 'Call Found',
        description: `Loaded call details for ID: ${callLookupId}`,
      });
      
      // Scroll to conversation viewer if available
      setTimeout(() => {
        const viewer = document.querySelector('[data-testid="conversation-viewer"]');
        if (viewer) {
          viewer.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Error looking up call:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to look up call',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-600" />
          Outbound Caller
        </CardTitle>
        <CardDescription>
          Place outbound calls using the selected AI agent or look up existing calls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            <Button 
              type="button" 
              variant={!isLookupMode ? "default" : "outline"}
              onClick={() => setIsLookupMode(false)}
              className="flex-1"
            >
              Make Call
            </Button>
            <Button 
              type="button" 
              variant={isLookupMode ? "default" : "outline"}
              onClick={() => setIsLookupMode(true)}
              className="flex-1"
            >
              Lookup Call
            </Button>
          </div>
        </div>
        
        {isLookupMode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="callLookupId" className="text-sm font-medium">
                Conversation ID or Call ID
              </label>
              <div className="flex gap-2">
                <Input
                  id="callLookupId"
                  placeholder="Enter conversation or call ID"
                  value={callLookupId}
                  onChange={(e) => setCallLookupId(e.target.value)}
                  className="border-gray-300 flex-1"
                />
                <Button 
                  onClick={handleLookupCall} 
                  disabled={isLoading}
                  className="whitespace-nowrap"
                >
                  {isLoading ? 'Looking up...' : 'Find Call'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="agent" className="text-sm font-medium">
                Select Agent
              </label>
              <Select
                value={selectedAgentId}
                onValueChange={handleAgentChange}
              >
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.length > 0 ? (
                    agents.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      {isLoadingAgents ? "Loading agents..." : "No agents available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Initiating Call...' : 'Start Call'}
            </Button>
          </form>
        )}
        
        {callResult?.success && callResult.conversationId && (
          <Alert className={`mt-4 ${callResult.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <AlertTitle className="flex items-center justify-between">
              {callResult.status === 'completed' 
                ? "Call Completed Successfully" 
                : `Call ${callResult.status || 'initiated'}`}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => {
                  navigator.clipboard.writeText(callResult.conversationId || '');
                  toast({
                    title: "Copied!",
                    description: "Conversation ID copied to clipboard"
                  });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <div className="text-sm mb-1">
                  <span className="font-medium">Conversation ID:</span> {callResult.conversationId}
                </div>
                {callResult.callId && (
                  <div className="text-sm">
                    <span className="font-medium">Call ID:</span> {callResult.callId}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">Status:</span> {callResult.status || 'initiated'}
                  {callResult.status === 'completed' && (
                    <Badge className="ml-2 bg-green-100 text-green-800">Completed</Badge>
                  )}
                  {callResult.status === 'in-progress' && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800">In Progress</Badge>
                  )}
                </div>
                {callResult.timestamp && (
                  <div className="text-xs text-gray-500 mt-1">
                    {callResult.status === 'completed'
                      ? `Completed at: ${new Date(callResult.timestamp).toLocaleTimeString()}`
                      : `Last updated: ${new Date(callResult.timestamp).toLocaleTimeString()}`
                    }
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full text-xs" 
                onClick={() => {
                  // Update the conversation viewer with this ID
                  const event = new CustomEvent('view-conversation', { 
                    detail: { id: callResult.conversationId } 
                  });
                  window.dispatchEvent(event);
                  
                  // Scroll to conversation viewer
                  const viewer = document.querySelector('[data-testid="conversation-viewer"]');
                  if (viewer) {
                    viewer.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" /> View Conversation Details
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
