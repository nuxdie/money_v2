// src/components/DataEntryForm.tsx
import React, { useState } from 'react';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';
import { FiCalendar, FiDollarSign, FiBriefcase } from 'react-icons/fi';

interface DataEntryFormProps {
  db: SQLJsDatabase<typeof schema>;
  onDataAdded: () => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

export function DataEntryForm({ db, onDataAdded, showNotification }: DataEntryFormProps) {
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
      showNotification('Data added successfully!', 'success');
    } catch (error) {
      console.error('Error adding data:', error);
      showNotification('Failed to add data. Please try again.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Financial Data</h2>
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="text-gray-400" />
          </div>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">Income</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiDollarSign className="text-gray-400" />
          </div>
          <input
            type="number"
            id="income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            step="0.01"
            className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="worth" className="block text-sm font-medium text-gray-700 mb-1">Worth</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiBriefcase className="text-gray-400" />
          </div>
          <input
            type="number"
            id="worth"
            value={worth}
            onChange={(e) => setWorth(e.target.value)}
            step="0.01"
            className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
      >
        Add Data
      </button>
    </form>
  );
}