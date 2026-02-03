'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, Users } from 'lucide-react';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SplitsList from './_components/splits-list';
import CreateSplitForm from './_components/create-split-form';

function SplitsPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  // Show create form if in create mode
  if (mode === 'create') {
    return <CreateSplitForm />;
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Split Transactions</h1>
          <p className="text-gray-600 mt-2">Split expenses with your friends</p>
        </div>
        <div className="flex items-center space-x-2">
          <Receipt className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-600">Share expenses easily</span>
        </div>
      </div>

      {/* Splits List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Your Split Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
            <SplitsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function SplitsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
      <SplitsPageContent />
    </Suspense>
  );
}

export default SplitsPage;