
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Clock, Phone, User, Search, MessageSquare, FileAudio } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchConversationData } from '../utils/api';

export const ConversationViewer = () => {
  const [conversationId, setConversationId] = useState('');
  const [searchId, setSearchId] = useState('');
  
  // Listen for the custom event from OutboundCaller
  useEffect(() => {
    const handleViewConversation = (event: CustomEvent<{id: string}>) => {
      if (event.detail && event.detail.id) {
        setConversationId(event.detail.id);
        setSearchId(event.detail.id);
      }
    };
    
    // Add event listener
    window.addEventListener('view-conversation', handleViewConversation as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('view-conversation', handleViewConversation as EventListener);
    };
  }, []);

  const { data: conversationData, isLoading, error } = useQuery({
    queryKey: ['conversation', searchId],
    queryFn: () => fetchConversationData(searchId),
    enabled: !!searchId,
  });

  const handleSearch = () => {
    if (conversationId.trim()) {
      setSearchId(conversationId.trim());
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Display agent information
  const renderAgentInfo = () => {
    if (!conversationData?.data?.agent) return null;
    
    const agent = conversationData.data.agent;
    
    return (
      <div className="mb-6 p-4 border rounded-md bg-blue-50">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg">Agent Information</h3>
        </div>
        
        <div className="ml-2">
          <p className="text-base"><span className="font-semibold">Name:</span> {agent.name}</p>
          {agent.description && (
            <p className="mt-1 text-sm text-gray-600">
              {agent.description}
            </p>
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
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm" data-testid="conversation-viewer">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Conversation Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter conversation ID"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && searchId && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">Failed to load conversation</p>
            <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
          </div>
        )}

        {conversationData?.data && (
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Call ID: {conversationData.data.callId}
              </h3>
              <Badge 
                variant={conversationData.data.status === 'completed' ? 'default' : 'secondary'}
                className={conversationData.data.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              >
                {conversationData.data.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Duration: {formatDuration(conversationData.data.duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>Type: {conversationData.data.type}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Contact Details</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-600">From:</span> {conversationData.data.from}</p>
                <p><span className="text-gray-600">To:</span> {conversationData.data.to}</p>
              </div>
            </div>

            {renderAgentInfo()}

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="text-center p-2 bg-white rounded">
                <p className="font-medium text-gray-900">{conversationData.data.average_transcriber_latency}ms</p>
                <p className="text-gray-600">Transcriber</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="font-medium text-gray-900">{conversationData.data.average_agent_latency}ms</p>
                <p className="text-gray-600">Agent</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="font-medium text-gray-900">{conversationData.data.average_synthesizer_latency}ms</p>
                <p className="text-gray-600">Synthesizer</p>
              </div>
            </div>

            {/* Tabs for Transcript and Recording */}
            <Tabs defaultValue="transcript" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transcript" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Transcript
                </TabsTrigger>
                <TabsTrigger value="recording" className="flex items-center gap-1">
                  <FileAudio className="h-4 w-4" />
                  Recording
                </TabsTrigger>
              </TabsList>
              
              {/* Transcript Tab Content */}
              <TabsContent value="transcript" className="border rounded-md p-3 mt-2 max-h-96 overflow-y-auto">
                {conversationData.data.transcript && conversationData.data.transcript.length > 0 ? (
                  <div className="space-y-3">
                    {conversationData.data.transcript.map((entry, index) => {
                      // The transcript can have different structures, so we need to handle that
                      const speaker = entry.speaker || (entry.role === 'user' ? 'Customer' : 'Agent');
                      const text = entry.text || entry.content || entry.message || '';
                      const isAgent = speaker === 'Agent' || speaker === 'assistant' || speaker.toLowerCase().includes('agent');
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-2 rounded-lg ${isAgent ? 'bg-blue-50 ml-4' : 'bg-gray-100 mr-4'}`}
                        >
                          <p className="text-xs font-medium mb-1">{speaker}</p>
                          <p className="text-sm">{text}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No transcript data available</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Recording Tab Content */}
              <TabsContent value="recording">
                {conversationData.data.recordingUrl ? (
                  <div className="text-center">
                    <audio controls className="w-full mb-2">
                      <source src={conversationData.data.recordingUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <Button variant="outline" className="w-full mt-2" asChild>
                      <a href={conversationData.data.recordingUrl} target="_blank" rel="noopener noreferrer">
                        Download Recording
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No recording available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!searchId && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Enter a conversation ID to view details</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
