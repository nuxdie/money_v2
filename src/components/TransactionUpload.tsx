// src/components/TransactionUpload.tsx
import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';

interface TransactionUploadProps {
  db: SQLJsDatabase<typeof schema>;
  onDataProcessed: () => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function TransactionUpload({ db, onDataProcessed, showNotification }: TransactionUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const processFile = async () => {
    if (!file) {
      showNotification('Please select a file', 'warning'); // Changed to warning for better semantics
      return;
    }
  
    const text = await file.text();
    const rows = text.split('\n').filter(row => row.trim());
    const dataRows = rows.slice(1);  // Skip the header row
  
    // Process the CSV data here
    const processedData = dataRows.map(row => {
      const columns = row.split(',');
      return {
        date: columns[0],
        product: columns[1],
        amount: parseFloat(columns[2]),
        // Add more fields as needed
      };
    });
  
    // Insert processed data into the database
    try {
      for (const data of processedData) {
        await db.insert(schema.financialData).values({
          date: data.date,
          income: data.amount > 0 ? data.amount : null,
          worth: data.amount < 0 ? Math.abs(data.amount) : null,
        });
      }
      showNotification('Data processed and added successfully', 'success');
      onDataProcessed();
    } catch (error) {
      console.error('Error inserting data:', error);
      showNotification('Failed to process data. Please try again.', 'error');
    }
  };

  return (
    <div className="p-6 bg-theme-card shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-theme-text">Upload Transactions</h2>
      <div className="mb-6"> {/* Increased bottom margin for spacing */}
        <label htmlFor="csvFile" className="block text-sm font-medium text-theme-text-secondary mb-1">
          Select CSV file:
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-theme-secondary-1 border-dashed rounded-md bg-theme-secondary-2 hover:border-theme-primary-accent1 transition-colors">
          <div className="space-y-1 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-theme-text-secondary" />
            <div className="flex text-sm text-theme-text-secondary">
              <label
                htmlFor="csvFile"
                className="relative cursor-pointer bg-theme-card rounded-md font-medium text-theme-primary-accent1 hover:text-theme-primary-accent2 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-theme-primary-accent1"
              >
                <span>Upload a file</span>
                <input id="csvFile" name="csvFile" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-theme-text-secondary">
              CSV up to 10MB
            </p>
            {file && <p className="text-sm text-theme-success-text mt-2">Selected: {file.name}</p>}
          </div>
        </div>
      </div>
      <button
        onClick={processFile}
        disabled={!file}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiUpload className="mr-2" />
        Process File
      </button>
    </div>
  );
}