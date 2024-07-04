// src/App.tsx
import { useState, useEffect, FormEvent, useRef } from 'react';
import { savePassword, getPassword, clearPassword } from './utils/passwordStorage';
import Dygraph from 'dygraphs';
import { SQLJsDatabase, drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema';
import { DataEntryForm } from './components/DataEntryForm';
import { encryptDatabase } from './utils/encryption';

const { financialData } = schema;

function App() {
  const [db, setDb] = useState<SQLJsDatabase<typeof schema>>();
  const [password, setPassword] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Dygraph | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [shouldDecrypt, setShouldDecrypt] = useState(false);

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
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Please check your password.');
      setShouldDecrypt(false);  // Reset shouldDecrypt on failure
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
    } catch (error) {
      console.error('Error downloading database:', error);
      alert('Failed to download database. Please try again.');
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
      const data = await db.select().from(financialData).orderBy(financialData.date);
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
            height: window.innerHeight - 100,
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoFocus={true}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {showForm ? 'Hide Form' : 'Add New Data'}
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Download Encrypted Database
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
      {showForm && db && (
        <div className="mb-4">
          <DataEntryForm db={db} onDataAdded={loadChartData} />
        </div>
      )}
      <div ref={chartRef} className="w-full h-[calc(100vh-120px)]"></div>
    </div>
  );
}

export default App;