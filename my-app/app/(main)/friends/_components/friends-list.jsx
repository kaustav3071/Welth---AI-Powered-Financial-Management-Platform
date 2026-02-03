'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserX, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      const data = await response.json();
      
      if (response.ok) {
        setFriends(data.friends || []);
      } else {
        toast.error('Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to fetch friends');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    if (!confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Friend removed successfully!');
        fetchFriends(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friendship) => (
            <Card key={friendship.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {friendship.user.imageUrl ? (
                        <img
                          src={friendship.user.imageUrl}
                          alt={friendship.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-lg">
                          {friendship.user.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {friendship.user.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600">{friendship.user.email}</p>
                      <Badge variant="outline" className="text-green-600 border-green-600 mt-1">
                        Friends
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveFriend(friendship.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
          <p className="text-gray-600 mb-4">
            Send friend requests to start splitting expenses with your friends
          </p>
        </div>
      )}
    </div>
  );
}
