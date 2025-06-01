import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '../utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, ExternalLink, Bot, Phone } from 'lucide-react';

export function RecentConversations() {
  const { data: conversationsResponse, isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchConversations({ page: 1, offset: 10 }),
    staleTime: 30000, // 30 seconds
  });

  const formatDate = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <p className="text-red-600 font-medium">Failed to load conversations</p>
        <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
      </Card>
    );
  }

  const conversations = conversationsResponse?.data || [];

  if (conversations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-600">No recent conversations found</p>
      </Card>
    );
  }

  const handleViewConversation = (conversationId: string) => {
    // Dispatch custom event to update the conversation viewer
    const event = new CustomEvent('view-conversation', { 
      detail: { id: conversationId } 
    });
    window.dispatchEvent(event);
    
    // Scroll to conversation viewer
    const viewer = document.querySelector('[data-testid="conversation-viewer"]');
    if (viewer) {
      viewer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <Card key={conversation._id || conversation.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {conversation.type === 'outbound' ? (
                  <Phone className="h-4 w-4 text-blue-600" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-green-600" />
                )}
                <h3 className="font-semibold">{conversation.callId || conversation._id || 'Conversation'}</h3>
                <Badge 
                  variant={conversation.status === 'completed' ? 'default' : 'secondary'}
                  className={conversation.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                >
                  {conversation.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(conversation.timestamp || conversation.createdAt || Date.now())}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Bot className="h-3.5 w-3.5" />
                <span>{conversation.agentName || 'Unknown Agent'}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8"
              onClick={() => handleViewConversation(conversation._id || conversation.id)}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
