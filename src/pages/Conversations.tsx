import React, { useState } from 'react';
import { ConversationViewer } from '../components/ConversationViewer';
import { RecentConversations } from '../components/RecentConversations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageCircle, Search, History } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const Conversations = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Conversations</h1>
      
      <Tabs defaultValue="lookup" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="lookup" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Conversation Lookup
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            Recent Conversations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lookup" className="space-y-4">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Conversation Lookup
              </CardTitle>
              <CardDescription>
                Enter a conversation ID to view details, transcript, and recordings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversationViewer />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Recent Conversations
              </CardTitle>
              <CardDescription>
                View and access your recent conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentConversations />
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Conversation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConversationViewer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Conversations;
