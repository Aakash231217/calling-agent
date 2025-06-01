
import React from 'react';
import { UserProfile } from '../components/UserProfile';
import { ConversationViewer } from '../components/ConversationViewer';
import { AgentList } from '../components/AgentList';
import { RecentConversations } from '../components/RecentConversations';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <UserProfile />
        
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Available Agents
            </CardTitle>
            <CardDescription>
              Agents ready for conversations and outbound calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentList />
          </CardContent>
          <CardFooter>
            <Link to="/agents" className="w-full">
              <Button variant="outline" className="w-full">
                <span>View All Agents</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Recent Conversations
            </CardTitle>
            <CardDescription>
              Latest conversations across all agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentConversations />
          </CardContent>
          <CardFooter>
            <Link to="/conversations" className="w-full">
              <Button variant="outline" className="w-full">
                <span>View All Conversations</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Telephony Actions
            </CardTitle>
            <CardDescription>
              Quick access to telephony features
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link to="/telephony" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Phone className="mr-2 h-4 w-4" />
                Make Outbound Call
              </Button>
            </Link>
            <Link to="/telephony?tab=lookup" className="w-full">
              <Button variant="outline" className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Look Up Call
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
