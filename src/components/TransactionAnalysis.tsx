// src/components/TransactionAnalysis.tsx
import React, { useState } from 'react';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';
import { TransactionsTable } from './TransactionsTable';
import { GroupedTransactions } from './GroupedTransactions';
import { 
  parseData, 
  groupBy, 
  Transaction, 
  GroupedTransactions as GroupedTransactionsType 
} from '../utils/transactionHelpers';

interface TransactionAnalysisProps {
  db: SQLJsDatabase<typeof schema>;
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function TransactionAnalysis({ showNotification }: TransactionAnalysisProps) {
  const [totalsData, setTotalsData] = useState<GroupedTransactionsType[]>([]);
  const [groupedByIsin, setGroupedByIsin] = useState<GroupedTransactionsType[]>([]);
  const [dataProcessed, setDataProcessed] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      const dataRows = rows.slice(1);
  
      const parsedData: Transaction[] = parseData(dataRows.map(row => row.split(',')));
      const groupedData: GroupedTransactionsType[] = groupBy(parsedData, 'ISIN');
  
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
    <div className="bg-theme-card shadow-lg rounded-lg p-6 transition-all hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-theme-text">Transaction Analysis</h2>
      {/* Basic file input styling, can be enhanced further */}
      <div className="mb-6">
        <label htmlFor="file-upload" className="sr-only">Choose file</label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-theme-text-secondary
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border file:border-theme-secondary-1
            file:text-sm file:font-semibold
            file:bg-theme-secondary-2 file:text-theme-primary-accent1
            hover:file:bg-theme-secondary-1 hover:file:text-theme-primary-accent2
            focus:outline-none focus:ring-2 focus:ring-theme-primary-accent1 focus:border-transparent
            transition-all cursor-pointer"
        />
      </div>

      {dataProcessed && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-theme-text">Totals</h3>
            <TransactionsTable<GroupedTransactionsType>
              headers={['id', 'name', 'sumBuy', 'sumSell', 'sumAll', 'sumAantal', 'returnsRatio']}
              data={totalsData}
              showHref={true}
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-theme-text">Grouped by ISIN</h3>
            <GroupedTransactions groupedData={groupedByIsin} />
          </div>
        </>
      )}
    </div>
  );
}