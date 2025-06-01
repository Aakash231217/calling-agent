import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OutboundCaller } from '../components/OutboundCaller';
import { ConversationViewer } from '../components/ConversationViewer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, PhoneOutgoing, History, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const Telephony = () => {
  const [activeTab, setActiveTab] = useState('outbound');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle URL query parameters for tab selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'lookup') {
      setActiveTab('lookup');
    }
  }, [location]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/telephony${value === 'lookup' ? '?tab=lookup' : ''}`, { replace: true });
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Telephony</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="outbound" className="flex items-center gap-1">
            <PhoneOutgoing className="h-4 w-4" />
            Make Call
          </TabsTrigger>
          <TabsTrigger value="lookup" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Lookup Call
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="outbound" className="space-y-4">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Outbound Calling
              </CardTitle>
              <CardDescription>
                Make outbound calls using any agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OutboundCaller />
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Call Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConversationViewer />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lookup" className="space-y-4">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Call Lookup
              </CardTitle>
              <CardDescription>
                Look up call details by conversation ID or call ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OutboundCaller initialMode={'lookup'} />
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                Call Details
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

export default Telephony;
