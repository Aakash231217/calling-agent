
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Building, Shield } from 'lucide-react';
import { fetchUserData } from '../utils/api';

export const UserProfile = () => {
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserData,
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <User className="h-5 w-5" />
            User Profile - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load user data</p>
          <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  const user = userData?.data;

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{user?.userEmail}</span>
            </div>
          </div>
          {user?.isEmailVerified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Organization ID:</span>
            <span className="text-sm font-medium text-gray-900 font-mono">
              {user?.organizationId}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Auth Provider:</span>
            <Badge variant="outline">{user?.authProvider}</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">User ID:</span>
            <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {user?._id}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
