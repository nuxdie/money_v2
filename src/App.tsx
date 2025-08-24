// src/App.tsx
import { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { savePassword, getPassword, clearPassword } from './utils/passwordStorage';
import { FiPlusCircle, FiDownload, FiLogOut, FiLock, FiDollarSign, FiList, FiGithub, FiVolume2 } from 'react-icons/fi';
import { SQLJsDatabase, drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema';
import { DataEntryForm } from './components/DataEntryForm';
import { encryptDatabase } from './utils/encryption';
import { Notification } from './components/Notification';
import { NetWorthGraph } from './components/NetWorthGraph';
import { TransactionAnalysis } from './components/TransactionAnalysis';

function App() {
  const [db, setDb] = useState<SQLJsDatabase<typeof schema>>();
  const [password, setPassword] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false); // Tracks if the database is currently decrypted and accessible
  const [showForm, setShowForm] = useState(false); // Toggles visibility of the DataEntryForm
  const [shouldDecrypt, setShouldDecrypt] = useState(false); // Flag to trigger decryption attempt after password entry/retrieval
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; actionText?: string; onAction?: () => void; } | null>(null);
  const [activeTab, setActiveTab] = useState<'netWorth' | 'transactions'>('netWorth');
  const [dataVersion, setDataVersion] = useState(0);
  // const [showUpdateReminder, setShowUpdateReminder] = useState(false); // Replaced by new notification system

  // Function to show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error', actionText?: string, onAction?: () => void) => {
    setNotification({ message, type, actionText, onAction });
    setTimeout(() => setNotification(null), 5000); // Auto-dismiss after 5 seconds
  }, []);

  // Audio for pronunciation (persisted across renders)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio('/broccori.mp3');
    audioRef.current.preload = 'auto';
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Play pronunciation and handle errors via notifications
  const playPronunciation = useCallback(async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/broccori.mp3');
        audioRef.current.preload = 'auto';
      }
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      // Optionally show a brief success notification:
      // showNotification('Playing pronunciation', 'success');
    } catch (err) {
      console.error('Audio playback failed', err);
      showNotification('Unable to play pronunciation', 'error');
    }
  }, [showNotification]);

  const initializeDb = useCallback(async (decryptedData: ArrayBuffer) => {
    const SQL = await window.initSqlJs({
      locateFile: (file: string) => `/${file}`,
    });
    const sqldb = new SQL.Database(new Uint8Array(decryptedData));
    setDb(drizzle(sqldb, { schema }));
    setIsDecrypted(true);
  }, []);

  const deriveKey = useCallback(async (password: string, salt: ArrayBuffer) => {
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
  }, []);

  const handleDecrypt = useCallback(async () => {
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
  }, [password, showNotification, initializeDb, deriveKey]);

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
  }, [shouldDecrypt, password, handleDecrypt]);

  const handleLogout = () => {
    clearPassword();
    setIsDecrypted(false);
    setPassword('');
    setDb(undefined);
  }

  const handleDataAdded = () => {
    setDataVersion(prev => prev + 1);
    // setShowUpdateReminder(true); // This will be handled by the new notification in DataEntryForm
  };

  if (!isDecrypted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
        <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-lg w-full max-w-md transform transition-all hover:scale-105">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Financial Dashboard</h2>
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
            actionText={notification.actionText}
            onAction={notification.onAction}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between bg-white shadow-lg rounded-lg p-6 relative overflow-visible">
        <div className="flex items-center mb-4 sm:mb-0 relative">
          {/* Logo: larger, centered vertically with header content */}
          <div className="absolute -left-1 -bottom-6">
            <img
              src="/broccori.png"
              alt="Broccori Logo"
              className="h-32 object-contain"
            />
          </div>

          {/* add left offset so text doesn't sit under the absolute logo */}
          <div className="ml-32 flex items-center">
            <div>
              <h1 className="block text-3xl font-bold text-gray-900">
                ファイナンシャル ブロッコリー
              </h1>
              <div className="flex items-center">
                <span className="block text-sm text-gray-500 mt-1 mr-2">
                  [Fah-ee-nah-n-shah-ru Bu-ro-kko-ree]
                </span>
                <button
                  onClick={playPronunciation}
                  aria-label="Play pronunciation"
                  className="pt-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                >
                  <FiVolume2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <a
            href="https://github.com/WiegerWolf/money_v2"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 border-2 border-gray-800 text-gray-800 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all hover:scale-105"
          >
            <FiGithub className="mr-2" />
            GitHub
          </a>
          <button
            onMouseDown={handleDownload}
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:scale-105"
          >
            <FiDownload className="mr-2" />
            Download DB
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center px-4 py-2 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all hover:scale-105"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Net Worth</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`flex items-center px-3 py-2 ${
                    showForm 
                      ? 'border-2 border-green-500 text-green-600 hover:bg-green-50' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200`}
                >
                  <FiPlusCircle className="mr-2" />
                  {showForm ? 'Hide Form' : 'Add Data'}
                </button>
              </div>
              {showForm && (
                <DataEntryForm
                  db={db}
                  onDataAdded={handleDataAdded}
                  showNotification={showNotification}
                  handleDownload={handleDownload}
                />
              )}
              <NetWorthGraph db={db} dataVersion={dataVersion} />
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
          actionText={notification.actionText}
          onAction={notification.onAction}
        />
      )}
    </div>
  );
}

export default App;