// src/components/TransactionUpload.tsx
import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';

interface TransactionUploadProps {
  db: SQLJsDatabase<typeof schema>;
  onDataProcessed: () => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
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
      showNotification('Please select a file', 'error');
      return;
    }

    const text = await file.text();
    const rows = text.split('\n').filter(row => row.trim());
    const [header, ...dataRows] = rows;

    // Process the CSV data here
    // This is a simplified example, you'll need to adapt it to your specific CSV structure
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
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Transactions</h2>
      <div className="mb-4">
        <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-1">
          Select CSV file:
        </label>
        <input
          type="file"
          id="csvFile"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      <button
        onClick={processFile}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <FiUpload className="mr-2" />
        Process File
      </button>
    </div>
  );
}