import { useState, useEffect } from 'react'
import './App.css'
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
      <div>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter password"
        />
        <button onClick={handleDecrypt}>Decrypt Database</button>
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <ul>
          {userList.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
      </div>
    </>
  )
}

export default App