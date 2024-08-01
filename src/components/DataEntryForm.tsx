import React, { useState } from 'react';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';
import { FiCalendar, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CurrencyInput from 'react-currency-input-field';

interface DataEntryFormProps {
  db: SQLJsDatabase<typeof schema>;
  onDataAdded: () => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

export function DataEntryForm({ db, onDataAdded, showNotification }: DataEntryFormProps) {
  const [date, setDate] = useState<Date | null>(new Date());
  const [income, setIncome] = useState('');
  const [worth, setWorth] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      showNotification('Please select a date.', 'error');
      return;
    }
    try {
      const formattedDate = date.toISOString().split('T')[0];
      await db.insert(schema.financialData).values({
        date: formattedDate,
        income: income ? parseFloat(income.replace(/[^0-9.-]+/g, '')) : null,
        worth: worth ? parseFloat(worth.replace(/[^0-9.-]+/g, '')) : null,
      });
      onDataAdded();
      setDate(new Date());
      setIncome('');
      setWorth('');
      showNotification('Data added successfully! Remember to update the DB in the repository.', 'success');
    } catch (error) {
      console.error('Error adding data:', error);
      showNotification('Failed to add data. Please try again.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg transition-all hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Financial Data</h2>
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <div className="relative">
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => setDate(date)}
            dateFormat="yyyy-MM-dd"
            className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="text-gray-400" />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">Income</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiDollarSign className="text-gray-400" />
          </div>
          <CurrencyInput
            id="income"
            name="income"
            placeholder="Enter income"
            value={income}
            onValueChange={(value) => setIncome(value || '')}
            prefix="$"
            decimalsLimit={2}
            className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="worth" className="block text-sm font-medium text-gray-700 mb-1">Net Worth</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiBriefcase className="text-gray-400" />
          </div>
          <CurrencyInput
            id="worth"
            name="worth"
            placeholder="Enter net worth"
            value={worth}
            onValueChange={(value) => setWorth(value || '')}
            prefix="$"
            decimalsLimit={2}
            className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all hover:scale-105"
      >
        Add Data
      </button>
    </form>
  );
}