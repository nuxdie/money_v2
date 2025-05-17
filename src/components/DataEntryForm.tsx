import React, { useState } from 'react';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';
import { FiCalendar, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import CurrencyInput from 'react-currency-input-field'; // Removed as per plan
import { evaluateMathExpression } from '../utils/transactionHelpers';

export interface DataEntryFormProps { // Exporting for use in App.tsx if needed for stricter typing
  db: SQLJsDatabase<typeof schema>;
  onDataAdded: () => void;
  showNotification: (message: string, type: 'success' | 'error', actionText?: string, onAction?: () => void) => void;
  handleDownload: () => Promise<void>; // Add handleDownload prop
}

export function DataEntryForm({ db, onDataAdded, showNotification, handleDownload }: DataEntryFormProps) {
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
      
      // Automatically download the database
      await handleDownload(); // Note: handleDownload in App.tsx is async, so await it here.

      setDate(new Date());
      setIncome('');
      setWorth('');
      setDisplayIncome('');
      setDisplayWorth('');
      // Updated notification message
      showNotification(
        'Data added successfully! Database download started. You can also click to download again.',
        'success',
        'Download Again', // Changed button text for clarity
        handleDownload
      );
    } catch (error) {
      console.error('Error adding data:', error);
      showNotification('Failed to add data. Please try again.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-theme-card shadow-lg rounded-lg transition-all hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-theme-text">Add Financial Data</h2>
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
        <div className="mb-4 md:mb-0 md:flex-1">
          <label htmlFor="date" className="block text-sm font-medium text-theme-text-secondary mb-1">Date</label>
          <div className="relative">
            <DatePicker
              selected={date}
              onChange={(date: Date | null) => setDate(date)}
              dateFormat="yyyy-MM-dd"
              className="input-field pl-10 mt-1 block w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="text-theme-text-secondary" />
            </div>
          </div>
        </div>
        <div className="mb-4 md:mb-0 md:flex-1">
          <label htmlFor="income" className="block text-sm font-medium text-theme-text-secondary mb-1">Income</label>
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
              className="input-field pl-10 pr-3 py-2 mt-1 block w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiDollarSign className="text-theme-text-secondary" />
            </div>
          </div>
        </div>
        <div className="mb-6 md:mb-0 md:flex-1">
          <label htmlFor="worth" className="block text-sm font-medium text-theme-text-secondary mb-1">Net Worth</label>
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
              className="input-field pl-10 pr-3 py-2 mt-1 block w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiBriefcase className="text-theme-text-secondary" />
            </div>
          </div>
        </div>
        <div className="md:ml-4">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-theme-success text-white rounded-md hover:bg-theme-success-hover focus:outline-none focus:ring-2 focus:ring-theme-success transition-all hover:scale-105"
          >
            Add Data
          </button>
        </div>
      </div>
    </form>
  );
}