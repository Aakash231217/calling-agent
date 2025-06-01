
import { ArrowRight, Database, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            API Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect to your API endpoints and manage user profiles and conversations with a beautiful, modern interface.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Open Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                View and manage user profiles with detailed information including verification status and organization details.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Conversation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Access detailed conversation logs, agent information, and performance metrics for your API calls.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <Database className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>API Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Seamlessly connect to external APIs with proper authentication and error handling built-in.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Features
            </h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                Real-time API data fetching with React Query
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                Responsive design with modern UI components
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                Error handling and loading states
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                Secure API key management
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
