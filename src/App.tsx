import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SQLJsDatabase, drizzle } from 'drizzle-orm/sql-js';

function loadBinaryFile(path: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      const data = new Uint8Array(xhr.response);
      resolve(data);
    };
    xhr.onerror = function() {
      reject(xhr);
    };
    xhr.send();
  });
}

let db: SQLJsDatabase;
try {
  const SQL = await window.initSqlJs({
    locateFile: (file: string) => `./${file}`,
  });
  const dbFile = await loadBinaryFile('/db.sqlite');
  const sqldb = new SQL.Database(dbFile);
  db = drizzle(sqldb);
} catch (error) {
  console.error(error);
}

function App() {
  const [count, setCount] = useState(0)

  if (!db) {
    return <p>Loading...</p>
  }

  db.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');
  db.query('INSERT INTO users (name) VALUES (?)', ['John']);
  db.query('INSERT INTO users (name) VALUES (?)', ['Jane']);

  console.log(db.select().from('users').all());

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
