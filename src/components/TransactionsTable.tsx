// src/components/TransactionsTable.tsx
import React from 'react';

interface TransactionsTableProps {
  headers: string[];
  data: any[];
  showHref?: boolean;
}

export function TransactionsTable({ headers, data, showHref = false }: TransactionsTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          {showHref && <th className="border p-2">#</th>}
          {headers.map((header) => (
            <th key={header} className="border p-2">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className={`${row.className} ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
            {showHref && (
              <td className="border p-2">
                <a href={`#${row.id}`} className="text-blue-500 hover:text-blue-700">#</a>
              </td>
            )}
            {headers.map((header) => (
              <td key={header} className="border p-2">{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}