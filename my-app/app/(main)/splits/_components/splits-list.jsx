'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Receipt, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function SplitsList() {
  const [createdSplits, setCreatedSplits] = useState([]);
  const [participantSplits, setParticipantSplits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState({});
  const [processingActions, setProcessingActions] = useState({});

  useEffect(() => {
    fetchSplits();
    fetchAccounts();
  }, []);

  const fetchSplits = async () => {
    try {
      const response = await fetch('/api/splits');
      const data = await response.json();
      
      if (response.ok) {
        setCreatedSplits(data.createdSplits || []);
        setParticipantSplits(data.participantSplits || []);
        setCurrentUserId(data.currentUserId);
      } else {
        toast.error('Failed to fetch split requests');
      }
    } catch (error) {
      toast.error('Failed to fetch split requests');
    } finally {
      setIsLoading(false);
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

  const handleParticipantAction = async (splitId, action, accountId = null) => {
    if (processingActions[splitId]) {
      return;
    }

    setProcessingActions(prev => ({ ...prev, [splitId]: true }));

    try {
      const response = await fetch(`/api/splits/${splitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, accountId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Split request ${action}d successfully!`);
        
        // Immediately update local state to hide buttons
        setParticipantSplits(prev => 
          prev.map(split => {
            if (split.id === splitId) {
              return {
                ...split,
                participants: split.participants.map(p => 
                  p.userId === currentUserId 
                    ? { ...p, status: action === 'approve' ? 'APPROVED' : 'DECLINED' }
                    : p
                )
              };
            }
            return split;
          })
        );
        
        // Clear the selected account for this split
        setSelectedAccounts(prev => {
          const newState = { ...prev };
          delete newState[splitId];
          return newState;
        });
        
        // Refresh the list after a short delay to ensure state is updated
        setTimeout(() => {
          fetchSplits();
        }, 100);
      } else {
        toast.error(data.error || `Failed to ${action} split request`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} split request`);
    } finally {
      setProcessingActions(prev => {
        const newState = { ...prev };
        delete newState[splitId];
        return newState;
      });
    }
  };

  const handleAccountSelection = (splitId, accountId) => {
    setSelectedAccounts(prev => ({
      ...prev,
      [splitId]: accountId
    }));
  };

  const handleAcceptWithAccount = async (splitId) => {
    const selectedAccountId = selectedAccounts[splitId];
    if (!selectedAccountId) {
      toast.error('Please select an account first');
      return;
    }
    
    try {
      await handleParticipantAction(splitId, 'approve', selectedAccountId);
    } catch (error) {
      toast.error('Failed to accept split request. Please try again.');
    }
  };

  const handleResendRequest = async (splitId) => {
    try {
      const response = await fetch(`/api/splits/${splitId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 're-request'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Split request resent to declined friends!');
        await fetchSplits(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to resend split request');
      }
    } catch (error) {
      toast.error('Failed to resend split request');
    }
  };

  const handlePayFullAmount = async (splitId) => {
    const selectedAccountId = selectedAccounts[`${splitId}_payfull`];
    if (!selectedAccountId) {
      toast.error('Please select an account first');
      return;
    }

    try {
      const response = await fetch(`/api/splits/${splitId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'pay-full',
          accountId: selectedAccountId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('You have paid the full amount for declined shares!');
        // Clear the selected account for this split
        setSelectedAccounts(prev => {
          const newState = { ...prev };
          delete newState[`${splitId}_payfull`];
          return newState;
        });
        await fetchSplits(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to pay full amount');
      }
    } catch (error) {
      toast.error('Failed to pay full amount');
    }
  };

  const handleCompleteWithoutAdding = async (splitId) => {
    try {
      const response = await fetch(`/api/splits/${splitId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete-without-adding'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Split request completed without adding transaction to your account!');
        await fetchSplits(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to complete split request');
      }
    } catch (error) {
      toast.error('Failed to complete split request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Created Splits */}
      {createdSplits.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Created by You</h3>
            <Button
              onClick={fetchSplits}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
          <div className="space-y-4">
            {createdSplits.map((split) => (
              <Card key={split.id} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Receipt className="h-5 w-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">{split.description}</h4>
                        <Badge 
                          variant="outline" 
                          className={`${
                            split.status === 'COMPLETED' ? 'text-green-600 border-green-600' :
                            split.status === 'PENDING' ? 'text-blue-600 border-blue-600' :
                            'text-gray-600 border-gray-600'
                          }`}
                        >
                          {split.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Total: ₹{split.originalAmount} | Your share: ₹{split.splitAmount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(split.date)} • {split.category}
                      </p>
                    </div>
                  </div>
                  
                  {/* Participants */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Participants:</h5>
                    {split.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {participant.user.name} - ₹{participant.amount}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`${
                            participant.status === 'APPROVED' ? 'text-green-600 border-green-600' :
                            participant.status === 'DECLINED' ? 'text-red-600 border-red-600' :
                            'text-yellow-600 border-yellow-600'
                          }`}
                        >
                          {participant.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons for declined splits */}
                  {split.participants.some(p => p.status === 'DECLINED') && split.status !== 'COMPLETED' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          Some friends declined. What would you like to do?
                        </div>
                        <div className="flex items-center space-x-3 flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendRequest(split.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Resend Request
                          </Button>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Pay from:</span>
                            <select
                              value={selectedAccounts[`${split.id}_payfull`] || ''}
                              onChange={(e) => handleAccountSelection(`${split.id}_payfull`, e.target.value)}
                              className="h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="">Select account</option>
                              {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                  {account.name} (₹{account.balance})
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              onClick={() => handlePayFullAmount(split.id)}
                              disabled={!selectedAccounts[`${split.id}_payfull`]}
                              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Pay Full Amount
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteWithoutAdding(split.id)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            Complete Without Adding
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completion message for completed splits */}
                  {split.status === 'COMPLETED' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Split request completed successfully!
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Participant Splits */}
      {participantSplits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests for You</h3>
          <div className="space-y-4">
            {participantSplits
              .filter(split => split.status === 'PENDING')
              .map((split) => {
                const participant = split.participants.find(p => p.userId === currentUserId);
                
                return (
                  <Card key={split.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="h-5 w-5 text-gray-600" />
                            <h4 className="font-medium text-gray-900">{split.description}</h4>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              PENDING
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            From: {split.requester.name} • Total: ₹{split.originalAmount}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Your share: ₹{participant?.amount ? parseFloat(participant.amount).toFixed(2) : 'Loading...'} • {formatDate(split.date)}
                          </p>
                          <p className="text-xs text-gray-500">{split.category}</p>
                        </div>
                        
                        {participant?.status === 'PENDING' && !processingActions[split.id] && (
                          <div className="flex flex-col space-y-3">
                            <div className="text-sm text-gray-600">Choose account to pay from:</div>
                            <Select
                              value={selectedAccounts[split.id] || ''}
                              onValueChange={(accountId) => handleAccountSelection(split.id, accountId)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select your account" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.name} (₹{account.balance})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptWithAccount(split.id)}
                                disabled={!selectedAccounts[split.id]}
                                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleParticipantAction(split.id, 'decline')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {processingActions[split.id] && (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-gray-600">Processing...</span>
                          </div>
                        )}
                        
                        {participant?.status === 'APPROVED' && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">Approved & Paid</span>
                          </div>
                        )}
                        
                        {participant?.status === 'DECLINED' && (
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-red-600 font-medium">Declined</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* No Splits */}
      {createdSplits.length === 0 && participantSplits.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No split transactions</h3>
          <p className="text-gray-600">
            Create your first split request to start sharing expenses with friends
          </p>
        </div>
      )}
    </div>
  );
}
