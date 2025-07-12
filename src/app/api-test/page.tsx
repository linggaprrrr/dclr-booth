'use client'

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';

export default function ApiTest() {
  const { setTransactionId } = useData();
  const { push } = useRouter();
  const [testTransactionId, setTestTransactionId] = useState('c589a05a-5c09-49d8-8f68-dffbf7e9619a');

  const handleTest = () => {
    setTransactionId(testTransactionId);
    push('/photo');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Test Transaction ID</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction ID:
          </label>
          <input
            type="text"
            value={testTransactionId}
            onChange={(e) => setTestTransactionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter transaction ID"
          />
        </div>
        
        <button
          onClick={handleTest}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Photo Page
        </button>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Sample Transaction ID:</p>
          <code className="bg-gray-100 p-1 rounded text-xs break-all">
            c589a05a-5c09-49d8-8f68-dffbf7e9619a
          </code>
        </div>
      </div>
    </div>
  );
} 