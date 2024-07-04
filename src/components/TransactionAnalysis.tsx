// src/components/TransactionAnalysis.tsx
import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';

interface TransactionAnalysisProps {
  db: SQLJsDatabase<typeof schema>;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

interface Transaction {
  date: string;
  product: string;
  isin: string;
  amount: number;
  price: number;
  total: number;
}

export function TransactionAnalysis({ db, showNotification }: TransactionAnalysisProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<Record<string, Transaction[]>>({});

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').filter(row => row.trim());
    const [header, ...dataRows] = rows;

    const parsedTransactions = dataRows.map(row => {
      const [date, product, isin, amount, price, total] = row.split(',');
      return {
        date,
        product,
        isin,
        amount: parseFloat(amount),
        price: parseFloat(price),
        total: parseFloat(total),
      };
    });

    setTransactions(parsedTransactions);
    groupTransactions(parsedTransactions);
    showNotification('Transactions processed successfully', 'success');
  };

  const groupTransactions = (transactions: Transaction[]) => {
    const grouped = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.isin]) {
        acc[transaction.isin] = [];
      }
      acc[transaction.isin].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    setGroupedTransactions(grouped);
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
      {Object.entries(groupedTransactions).map(([isin, groupTransactions]) => (
        <div key={isin} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{groupTransactions[0].product} ({isin})</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Date</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {groupTransactions.map((transaction, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="border p-2">{transaction.date}</td>
                  <td className="border p-2">{transaction.amount}</td>
                  <td className="border p-2">{transaction.price.toFixed(2)}</td>
                  <td className="border p-2">{transaction.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}