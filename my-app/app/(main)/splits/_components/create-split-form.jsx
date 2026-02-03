'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserPlus, 
  Calculator, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateSplitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Form state
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [transactionType, setTransactionType] = useState('');
  
  // Split state
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendShares, setFriendShares] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  
  // Data
  const [friends, setFriends] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Load data from URL params and fetch data
  useEffect(() => {
    if (searchParams.get('mode') === 'create') {
      setDescription(searchParams.get('description') || '');
      setTotalAmount(searchParams.get('amount') || '');
      setCategory(searchParams.get('category') || '');
      setDate(searchParams.get('date') || '');
      setAccountId(searchParams.get('accountId') || '');
      setTransactionType(searchParams.get('type') || '');
    }
    
    // Fetch friends and accounts
    fetchFriends();
    fetchAccounts();
  }, []); // Empty dependency array - only run once on mount

  const fetchFriends = async () => {
    try {
      setIsLoadingFriends(true);
      const response = await fetch('/api/friends');
      const data = await response.json();
      
      if (response.ok) {
        setFriends(data.friends || []);
      } else {
        toast.error(data.error || 'Failed to fetch friends');
      }
    } catch (error) {
      toast.error('Failed to fetch friends');
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/account');
      const data = await response.json();
      
      if (response.ok) {
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      // Error fetching accounts - handled silently
    }
  };

  const handleFriendToggle = (friendshipId) => {
    setSelectedFriends(prev => {
      const isSelected = prev.includes(friendshipId);
      if (isSelected) {
        // Remove friend and their share
        setFriendShares(prevShares => {
          const newShares = { ...prevShares };
          delete newShares[friendshipId];
          return newShares;
        });
        return prev.filter(id => id !== friendshipId);
      } else {
        // Add friend with equal share
        const total = parseFloat(totalAmount) || 0;
        const shareCount = prev.length + 1;
        const equalShare = total / shareCount;
        
        // Recalculate all shares to be equal
        const newShares = {};
        [...prev, friendshipId].forEach(id => {
          newShares[id] = equalShare;
        });
        newShares[friendshipId] = equalShare;
        
        setFriendShares(newShares);
        return [...prev, friendshipId];
      }
    });
  };

  const handleShareChange = (friendId, amount) => {
    setFriendShares(prev => ({
      ...prev,
      [friendId]: parseFloat(amount) || 0
    }));
  };

  const calculateRequesterShare = () => {
    const total = parseFloat(totalAmount) || 0;
    const friendsTotal = selectedFriends.reduce((sum, friendId) => {
      return sum + (friendShares[friendId] || 0);
    }, 0);
    return total - friendsTotal;
  };

  const validateForm = () => {
    if (!description.trim()) {
      toast.error('Please enter a description');
      return false;
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error('Please enter a valid total amount');
      return false;
    }
    if (!category) {
      toast.error('Please select a category');
      return false;
    }
    if (!date) {
      toast.error('Please select a date');
      return false;
    }
    if (!accountId) {
      toast.error('Please select an account');
      return false;
    }
    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend to split with');
      return false;
    }
    
    const requesterShare = calculateRequesterShare();
    if (requesterShare < 0) {
      toast.error('Friend shares cannot exceed the total amount');
      return false;
    }
    
    return true;
  };

  const handleCreateSplit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const requesterShare = calculateRequesterShare();
      const participants = selectedFriends.map(friendshipId => {
        const friend = friends.find(f => f.id === friendshipId);
        return {
          userId: friend.user.id,
          amount: friendShares[friendshipId]
        };
      });

      const response = await fetch('/api/splits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount: parseFloat(totalAmount),
          requesterShare,
          description,
          category,
          date: new Date(date),
          requesterAccountId: accountId,
          participants
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Split request created successfully!');
        router.push('/splits');
      } else {
        toast.error(data.error || 'Failed to create split request');
      }
    } catch (error) {
      toast.error('Failed to create split request');
    } finally {
      setIsLoading(false);
    }
  };

  const requesterShare = calculateRequesterShare();
  const selectedAccount = accounts.find(acc => acc.id === accountId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/transaction')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transaction
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Split Request</h1>
          <p className="text-gray-600">Split this expense with your friends</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dinner at restaurant"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="totalAmount">Total Amount (₹)</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Food & Dining"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="account">Your Account</Label>
              <select
                id="account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select your account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} (₹{account.balance})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Split Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Split Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Friend Selection */}
            <div>
              <Label className="text-sm font-medium">Select Friends</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {isLoadingFriends ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-gray-500">Loading friends...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-2">No friends found</p>
                    <p className="text-xs text-gray-400">
                      Add friends first by going to the Friends page
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => router.push('/friends')}
                    >
                      Go to Friends
                    </Button>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-3 p-2 border rounded-md hover:bg-gray-50">
                      <Checkbox
                        id={friend.id}
                        checked={selectedFriends.includes(friend.id)}
                        onCheckedChange={() => handleFriendToggle(friend.id)}
                      />
                      <Label htmlFor={friend.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {friend.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">{friend.user?.name || 'Unknown'}</span>
                            <p className="text-xs text-gray-500">{friend.user?.email}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Share Amounts */}
            {selectedFriends.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Share Amounts</Label>
                <div className="mt-2 space-y-2">
                  {selectedFriends.map((friendId) => {
                    const friend = friends.find(f => f.id === friendId);
                    return (
                      <div key={friendId} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {friend?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <span className="flex-1 text-sm">{friend?.user?.name || 'Unknown'}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={friendShares[friendId] || ''}
                            onChange={(e) => handleShareChange(friendId, e.target.value)}
                            className="w-20 h-8 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedFriends.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Amount:</span>
                  <span className="font-medium">₹{totalAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Friends Total:</span>
                  <span className="font-medium">
                    ₹{selectedFriends.reduce((sum, id) => sum + (friendShares[id] || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Your Share:</span>
                  <span className={requesterShare < 0 ? 'text-red-600' : 'text-green-600'}>
                    ₹{requesterShare.toFixed(2)}
                  </span>
                </div>
                {requesterShare < 0 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Friend shares exceed total amount</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/transaction')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateSplit}
          disabled={isLoading || selectedFriends.length === 0 || requesterShare < 0}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create Split Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
