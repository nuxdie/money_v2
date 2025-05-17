// src/components/TransactionsTable.tsx
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { GroupedTransactions, Transaction } from '../utils/transactionHelpers';

type TableData = GroupedTransactions | Transaction;

interface TransactionsTableProps<T extends TableData> {
  headers: (keyof T)[];
  data: T[];
  showHref?: boolean;
}

export function TransactionsTable<T extends TableData>({
  headers,
  data,
  showHref = false
}: TransactionsTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (sortColumn) {
      return [...data].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [data, sortColumn, sortDirection]);

  return (
    <div className="overflow-x-auto bg-theme-card shadow-cyber-shadow rounded-lg p-4">
      <table className="min-w-full divide-y divide-theme-secondary-1">
        <thead className="bg-theme-secondary-2 text-theme-text">
          <tr>
            {showHref && <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>}
            {headers.map((header) => (
              <th
                key={header as string}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort(header)}
              >
                <div className="flex items-center">
                  {header as string}
                  {sortColumn === header && (
                    sortDirection === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-theme-bg divide-y divide-theme-secondary-1 text-theme-text">
          {sortedData.map((row, index) => (
            <tr key={index} className={`${row.className || ''} hover:bg-theme-secondary-2`}>
              {showHref && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-primary hover:text-theme-primary-hover">
                  <a href={`#${row.id}`}>#</a>
                </td>
              )}
              {headers.map((header) => {
                const value = row[header];
              if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
                return (
                  <td key={header as string} className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCellValue(value)}
                  </td>
                );
              } else {
                return (
                  <td key={header as string} className="px-6 py-4 whitespace-nowrap text-sm">
                    Unknown type
                  </td>
                );
              }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCellValue(value: number | string | Date): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
}