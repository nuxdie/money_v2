import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SQLJsDatabase, drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema.ts';

const {users} = schema

function App() {
  const [db, setDb] = useState<SQLJsDatabase<typeof schema>>()
  const [userList, setUsers] = useState<typeof users.$inferInsert[]>([])

  useEffect(() => {
    (async () => {try {
      const SQL = await window.initSqlJs({
        locateFile: (file: string) => `/${file}`,
      });
      const dbFile = await (await fetch('/db.sqlite')).arrayBuffer();
      const sqldb = new SQL.Database(new Uint8Array(dbFile));
      setDb(drizzle(sqldb, {schema}));
    } catch (error) {
      console.error(error);
    }})().catch(console.error);
  }, []);

  if (!db) {
    return <p>Loading...</p>
  }

  db.query.users.findMany().then(users => setUsers(users))

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
        <button onClick={() => db.insert(users).values({name: 'John'})}>
          add user
        </button>
        {userList.map(user => <p key={user.id}>{user.name}</p>)}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
