// src/components/DataEntryForm.tsx
import React, { useState } from 'react';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';

interface DataEntryFormProps {
  db: SQLJsDatabase<typeof schema>;
  onDataAdded: () => void;
}

export function DataEntryForm({ db, onDataAdded }: DataEntryFormProps) {
  const [date, setDate] = useState('');
  const [income, setIncome] = useState('');
  const [worth, setWorth] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.insert(schema.financialData).values({
        date,
        income: income ? parseFloat(income) : null,
        worth: worth ? parseFloat(worth) : null,
      });
      onDataAdded();
      setDate('');
      setIncome('');
      setWorth('');
      alert('Data added successfully!');
    } catch (error) {
      console.error('Error adding data:', error);
      alert('Failed to add data. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-lg">
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="income" className="block text-sm font-medium text-gray-700">Income</label>
        <input
          type="number"
          id="income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="worth" className="block text-sm font-medium text-gray-700">Worth</label>
        <input
          type="number"
          id="worth"
          value={worth}
          onChange={(e) => setWorth(e.target.value)}
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Data
      </button>
    </form>
  );
}