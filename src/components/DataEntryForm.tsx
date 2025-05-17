import React, { useState } from 'react';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';
import { FiCalendar, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import CurrencyInput from 'react-currency-input-field'; // Removed as per plan
import { evaluateMathExpression } from '../utils/transactionHelpers';

interface DataEntryFormProps {
  db: SQLJsDatabase<typeof schema>;
  onDataAdded: () => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

export function DataEntryForm({ db, onDataAdded, showNotification }: DataEntryFormProps) {
  const [date, setDate] = useState<Date | null>(new Date());
  const [income, setIncome] = useState(''); // Stores raw string input
  const [worth, setWorth] = useState(''); // Stores raw string input
  const [displayIncome, setDisplayIncome] = useState('');
  const [displayWorth, setDisplayWorth] = useState('');

  const handleBlur = (field: 'income' | 'worth') => {
    const value = field === 'income' ? income : worth;
    const result = evaluateMathExpression(value);

    if (value.trim() !== '' && result === null) {
      showNotification(`Invalid expression in ${field} field.`, 'error');
      // Keep displaying the invalid raw expression
      if (field === 'income') setDisplayIncome(value);
      else setDisplayWorth(value);
    } else if (result !== null) {
      const formattedResult = result.toString(); // Or result.toFixed(2) if needed
      if (field === 'income') {
        setDisplayIncome(formattedResult);
      } else {
        setDisplayWorth(formattedResult);
      }
    } else { // Empty input or other cases
      if (field === 'income') setDisplayIncome('');
      else setDisplayWorth('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      showNotification('Please select a date.', 'error');
      return;
    }

    const calculatedIncome = evaluateMathExpression(income);
    const calculatedWorth = evaluateMathExpression(worth);

    if (income.trim() !== '' && calculatedIncome === null) {
      showNotification('Please enter a valid number or expression for income.', 'error');
      return;
    }
    if (worth.trim() !== '' && calculatedWorth === null) {
      showNotification('Please enter a valid number or expression for net worth.', 'error');
      return;
    }

    try {
      const formattedDate = date.toISOString().split('T')[0];
      await db.insert(schema.financialData).values({
        date: formattedDate,
        income: calculatedIncome, // Use evaluated number
        worth: calculatedWorth,   // Use evaluated number
      });
      onDataAdded();
      setDate(new Date());
      setIncome('');
      setWorth('');
      setDisplayIncome('');
      setDisplayWorth('');
      showNotification('Data added successfully! Remember to update the DB in the repository.', 'success');
    } catch (error) {
      console.error('Error adding data:', error);
      showNotification('Failed to add data. Please try again.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg transition-all hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Financial Data</h2>
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
        <div className="mb-4 md:mb-0 md:flex-1">
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
        <div className="mb-4 md:mb-0 md:flex-1">
          <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">Income</label>
          <div className="relative">
            <input
              type="text"
              id="income"
              name="income"
              placeholder="Enter income (e.g., 150+25)"
              value={displayIncome}
              onChange={(e) => {
                setIncome(e.target.value);
                setDisplayIncome(e.target.value);
              }}
              onBlur={() => handleBlur('income')}
              onFocus={() => setDisplayIncome(income)}
              className="pl-10 pr-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiDollarSign className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="mb-6 md:mb-0 md:flex-1">
          <label htmlFor="worth" className="block text-sm font-medium text-gray-700 mb-1">Net Worth</label>
          <div className="relative">
            <input
              type="text"
              id="worth"
              name="worth"
              placeholder="Enter net worth (e.g., 1000*1.05)"
              value={displayWorth}
              onChange={(e) => {
                setWorth(e.target.value);
                setDisplayWorth(e.target.value);
              }}
              onBlur={() => handleBlur('worth')}
              onFocus={() => setDisplayWorth(worth)}
              className="pl-10 pr-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiBriefcase className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="md:ml-4">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all hover:scale-105"
          >
            Add Data
          </button>
        </div>
      </div>
    </form>
  );
}