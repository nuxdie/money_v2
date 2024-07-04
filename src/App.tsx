// src/App.tsx
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { savePassword, getPassword, clearPassword } from './utils/passwordStorage';
import { FiPlusCircle, FiDownload, FiLogOut, FiLock, FiDollarSign, FiList } from 'react-icons/fi';
import { SQLJsDatabase, drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema';
import { DataEntryForm } from './components/DataEntryForm';
import { encryptDatabase } from './utils/encryption';
import { Notification } from './components/Notification';
import { NetWorthGraph } from './components/NetWorthGraph';
import { TransactionAnalysis } from './components/TransactionAnalysis';
import Dygraph from 'dygraphs';

function App() {
  const [db, setDb] = useState<SQLJsDatabase<typeof schema>>();
  const [password, setPassword] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Dygraph | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [shouldDecrypt, setShouldDecrypt] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'netWorth' | 'transactions'>('netWorth');

  // Function to show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const initializeDb = async (decryptedData: ArrayBuffer) => {
    const SQL = await window.initSqlJs({
      locateFile: (file: string) => `/${file}`,
    });
    const sqldb = new SQL.Database(new Uint8Array(decryptedData));
    setDb(drizzle(sqldb, { schema }));
    setIsDecrypted(true);
  }

  const deriveKey = async (password: string, salt: ArrayBuffer) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  const handleDecrypt = async () => {
    try {
      const response = await fetch('/encrypted-sqlite.db');
      const encryptedData = await response.arrayBuffer();

      // The first 16 bytes are the salt, the next 12 bytes are the IV
      const salt = encryptedData.slice(0, 16);
      const iv = encryptedData.slice(16, 28);
      const data = encryptedData.slice(28);

      const key = await deriveKey(password, salt);

      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        data
      );

      await initializeDb(decryptedContent);
      showNotification('Decryption successful!', 'success');
    } catch (error) {
      console.error('Decryption failed:', error);
      showNotification('Decryption failed. Please check your password.', 'error');
      setShouldDecrypt(false);
    }
  }

  interface Database {
    session: {
      client: {
        export(): Uint8Array;
      };
    };
  }
  const handleDownload = async () => {
    if (!db) return;

    try {
      // Export the database
      const exportedData = (db as unknown as Database).session.client.export();

      // Encrypt the database
      const encryptedData = await encryptDatabase(exportedData, password);

      // Create a Blob and download link
      const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'encrypted-sqlite.db';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Database downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading database:', error);
      showNotification('Failed to download database. Please try again.', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    savePassword(password);
    setShouldDecrypt(true);
  }

  useEffect(() => {
    const storedPassword = getPassword();
    if (storedPassword) {
      setPassword(storedPassword);
      setShouldDecrypt(true);
    }
  }, []);

  useEffect(() => {
    if (shouldDecrypt && password) {
      handleDecrypt();
      setShouldDecrypt(false);
    }
  }, [shouldDecrypt, password]);

  const handleLogout = () => {
    clearPassword();
    setIsDecrypted(false);
    setPassword('');
    setDb(undefined);
  }

  const loadChartData = async () => {
    if (db && chartRef.current) {
      const data = await db.select().from(schema.financialData).orderBy(schema.financialData.date);
      const chartData = data.map(row => [
        new Date(row.date!),
        row.income,
        row.worth
      ]);

      if (graphRef.current) {
        graphRef.current.updateOptions({ file: chartData });
      } else {
        graphRef.current = new Dygraph(
          chartRef.current,
          chartData,
          {
            labels: ['Date', 'Income', 'Worth'],
            series: {
              'Income': {
                axis: 'y2'
              },
              'Worth': {
                axis: 'y2'
              },
            },
            axes: {
              y: {
                independentTicks: false
              },
              y2: {
                labelsKMB: true,
                independentTicks: true
              }
            },
            fillGraph: true,
            height: window.innerHeight - 120,
          }
        );
      }
    }
  };

  useEffect(() => {
    if (db && isDecrypted) {
      loadChartData();
    }
  }, [db, isDecrypted]);

  if (!isDecrypted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Your Financial Dashboard</h2>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus={true}
                className="pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Enter
          </button>
        </form>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50">
      <div className="mb-4 flex items-center justify-between bg-white shadow-md rounded-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
          >
            <FiPlusCircle className="mr-2" />
            {showForm ? 'Hide Form' : 'Add Data'}
          </button>
          <button
            onMouseDown={handleDownload}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FiDownload className="mr-2" />
            Download DB
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>
      {db && (
        <div>
          <div className="mb-4 flex border-b">
            <button
              className={`py-2 px-4 ${activeTab === 'netWorth' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('netWorth')}
            >
              <FiDollarSign className="inline mr-2" />
              Net Worth
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'transactions' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('transactions')}
            >
              <FiList className="inline mr-2" />
              Transactions
            </button>
          </div>
          {activeTab === 'netWorth' && (
            <div className="space-y-4">
              {showForm && (
                <DataEntryForm 
                  db={db} 
                  onDataAdded={loadChartData} 
                  showNotification={showNotification}
                />
              )}
              <NetWorthGraph db={db} />
            </div>
          )}
          {activeTab === 'transactions' && (
            <TransactionAnalysis db={db} showNotification={showNotification} />
          )}
        </div>
      )}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;