'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function PendingRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/friends');
      const data = await response.json();
      
      if (response.ok) {
        setPendingRequests(data.pendingRequests || []);
        setSentRequests(data.sentRequests || []);
      } else {
        toast.error('Failed to fetch pending requests');
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to fetch pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Friend request ${action}ed successfully!`);
        fetchPendingRequests(); // Refresh the list
      } else {
        toast.error(data.error || `Failed to ${action} friend request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      toast.error(`Failed to ${action} friend request`);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Friend request cancelled successfully!');
        fetchPendingRequests(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to cancel friend request');
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast.error('Failed to cancel friend request');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Received Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Received Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {request.requester.imageUrl ? (
                          <img
                            src={request.requester.imageUrl}
                            alt={request.requester.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            {request.requester.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.requester.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">{request.requester.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'accept')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestAction(request.id, 'decline')}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sent Requests</h3>
          <div className="space-y-3">
            {sentRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {request.addressee.imageUrl ? (
                          <img
                            src={request.addressee.imageUrl}
                            alt={request.addressee.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold">
                            {request.addressee.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.addressee.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">{request.addressee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Pending
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Requests */}
      {pendingRequests.length === 0 && sentRequests.length === 0 && (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No pending friend requests</p>
        </div>
      )}
    </div>
  );
}
