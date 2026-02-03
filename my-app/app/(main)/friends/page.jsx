import { getCurrentUser } from '@/actions/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, UserCheck, UserX, Mail } from 'lucide-react';
import React, { Suspense } from 'react';
import FriendsList from './_components/friends-list';
import PendingRequests from './_components/pending-requests';
import SendFriendRequest from './_components/send-friend-request';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

async function FriendsPage() {
  const user = await getCurrentUser();

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
          <p className="text-gray-600 mt-2">Manage your friends and split transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-600">Split expenses easily</span>
        </div>
      </div>

      {/* Send Friend Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Add New Friend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded"></div>}>
            <SendFriendRequest />
          </Suspense>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Pending Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded"></div>}>
            <PendingRequests />
          </Suspense>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Your Friends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
            <FriendsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

export default FriendsPage;
