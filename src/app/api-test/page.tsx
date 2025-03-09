'use client';

import { useState, useEffect } from 'react';

export default function ApiTestPage() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('1');
  const [formData, setFormData] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });

  const fetchApiStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError('Failed to fetch API status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError('Failed to submit data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Express API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-2">API Status</h2>
          <button 
            onClick={fetchApiStatus}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Check API Status
          </button>
        </div>

        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Get User</h2>
          <div className="mb-2">
            <label className="block text-sm font-medium">User ID:</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <button 
            onClick={fetchUser}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Fetch User
          </button>
        </div>

        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Submit Data</h2>
          <form onSubmit={submitData}>
            <div className="mb-2">
              <label className="block text-sm font-medium">Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <button 
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {apiData && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <pre className="bg-white p-4 rounded overflow-auto">
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 