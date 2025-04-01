'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConfigPage() {
  const [configStatus, setConfigStatus] = useState<{
    loaded: boolean;
    hasConfig: boolean;
    message?: string;
  }>({
    loaded: false,
    hasConfig: false
  });
  
  const [testStatus, setTestStatus] = useState<{ 
    testing: boolean;
    result?: { success: boolean; message: string } 
  }>({
    testing: false
  });

  useEffect(() => {
    // Check if configuration exists on the server
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        
        setConfigStatus({
          loaded: true,
          hasConfig: data.hasConfig,
          message: data.hasConfig 
            ? 'WhatsApp API configuration is set in environment variables' 
            : 'WhatsApp API configuration is not set in environment variables'
        });
      } catch (error) {
        console.error('Error checking config:', error);
        setConfigStatus({
          loaded: true,
          hasConfig: false,
          message: 'Error checking configuration status'
        });
      }
    };
    
    checkConfig();
  }, []);

  const testConfiguration = async () => {
    setTestStatus({ testing: true });
    
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test' }),
      });
      
      const data = await response.json();
      
      setTestStatus({
        testing: false,
        result: {
          success: response.ok,
          message: data.message || (response.ok ? 'Test successful' : 'Test failed')
        }
      });
    } catch (error) {
      console.error('Error testing config:', error);
      setTestStatus({
        testing: false,
        result: {
          success: false,
          message: 'Error testing configuration'
        }
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-3xl w-full">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">WhatsApp API Configuration</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="space-y-6 bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Environment Configuration</h2>
            <p className="mb-4">
              WhatsApp API credentials are now stored in environment variables (.env.local file) 
              for improved security.
            </p>
            
            {!configStatus.loaded ? (
              <p>Checking configuration status...</p>
            ) : (
              <div className={`p-4 rounded-md ${
                configStatus.hasConfig ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                <p>{configStatus.message}</p>
              </div>
            )}
          </div>
          
          {configStatus.hasConfig && (
            <div>
              <button
                onClick={testConfiguration}
                disabled={testStatus.testing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {testStatus.testing ? 'Testing...' : 'Test Configuration'}
              </button>
              
              {testStatus.result && (
                <div className={`mt-4 p-3 rounded-md ${
                  testStatus.result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {testStatus.result.message}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium mb-2">How to Configure</h3>
            <p className="text-sm text-gray-600 mb-2">
              To set up your WhatsApp API credentials:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Create a <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file in the root of your project</li>
              <li>Add the following variables with your credentials:
                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto text-xs">
                  WHATSAPP_API_KEY=your_api_key{'\n'}
                  WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id{'\n'}
                  WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id{'\n'}
                  WHATSAPP_ACCESS_TOKEN=your_access_token
                </pre>
              </li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}