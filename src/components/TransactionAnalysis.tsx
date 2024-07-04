// src/components/TransactionAnalysis.tsx
import React, { useState } from 'react';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';
import { TransactionsTable } from './TransactionsTable';
import { GroupedTransactions } from './GroupedTransactions';
import { parseData, groupBy } from '../utils/transactionHelpers';

interface TransactionAnalysisProps {
  db: SQLJsDatabase<typeof schema>;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

export function TransactionAnalysis({ db, showNotification }: TransactionAnalysisProps) {
  const [totalsData, setTotalsData] = useState([]);
  const [groupedByIsin, setGroupedByIsin] = useState([]);
  const [dataProcessed, setDataProcessed] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      const [header, ...dataRows] = rows;

      const parsedData = parseData(dataRows.map(row => row.split(',')));
      const groupedData = groupBy(parsedData, 'ISIN');

      setTotalsData(groupedData);
      setGroupedByIsin(groupedData);
      setDataProcessed(true);
      showNotification('Transactions processed successfully', 'success');
    } catch (error) {
      console.error('Error processing file:', error);
      showNotification('Error processing file. Please check the format.', 'error');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Transaction Analysis</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-4 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {dataProcessed && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Totals</h3>
            <TransactionsTable 
              headers={Object.keys(totalsData[0]).filter(col => !['className', 'transactions', 'id'].includes(col))}
              data={totalsData}
              showHref={true}
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Grouped by ISIN</h3>
            <GroupedTransactions groupedData={groupedByIsin} />
          </div>
        </>
      )}
    </div>
  );
}