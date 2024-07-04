import { useState, useEffect, FormEvent } from 'react'
import { SQLJsDatabase, drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema.ts';

const { users } = schema

function App() {
  const [db, setDb] = useState<SQLJsDatabase<typeof schema>>()
  const [userList, setUsers] = useState<typeof users.$inferInsert[]>([])
  const [password, setPassword] = useState('')
  const [isDecrypted, setIsDecrypted] = useState(false)

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
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleDecrypt();
  }

  useEffect(() => {
    if (db) {
      db
        .select()
        .from(users)
        .then(setUsers);
    }
  }, [db]);

  if (!isDecrypted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg">
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Decrypt Database
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">User List</h2>
        <ul className="space-y-2">
          {userList.map(user => (
            <li key={user.id} className="bg-gray-100 p-2 rounded">
              {user.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App