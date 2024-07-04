// src/components/GroupedTransactions.tsx
import React from 'react';
import { TransactionsTable } from './TransactionsTable';
import { UplotChart } from './UplotChart';

interface GroupedTransactionsProps {
  groupedData: any[];
}

export function GroupedTransactions({ groupedData }: GroupedTransactionsProps) {
  return (
    <div>
      {groupedData.map((group) => (
        <div key={group.id} id={group.id} className={`mb-6 p-4 rounded-lg ${group.className}`}>
          <h4 className="text-lg font-semibold mb-2">{group.name}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-semibold mb-2">Totals</h5>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Curr.HOLDINGS</th>
                    <th className="border p-2">BUY</th>
                    <th className="border p-2">SELL</th>
                    <th className="border p-2">EARNED</th>
                    <th className="border p-2">RETURN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">{group.sumAantal}</td>
                    <td className="border p-2">{group.sumBuy}</td>
                    <td className="border p-2">{group.sumSell}</td>
                    <td className="border p-2">{group.sumAll}</td>
                    <td className="border p-2">{group.returnsRatio.toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Graph</h5>
              <UplotChart data={convertData(group.transactions)} />
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Transactions</h5>
            <TransactionsTable 
              headers={Object.keys(group.transactions[0]).filter(col => !['unixtime', 'type', 'ISIN', 'className'].includes(col))}
              data={group.transactions}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function convertData(transactions) {
  return transactions.reduce((memo, { Datum, Tijd, Koers, Aantal }) => {
    if (memo.holdings === undefined) memo.holdings = 0;
    memo.holdings += Aantal;

    const _dateString = `${Datum.split('-').reverse().join('-')} ${Tijd}`;
    const _date = Math.floor(Date.parse(_dateString) / 1000);

    memo[0].push(_date);
    memo[1].push(Koers);

    if (!memo.holdings) {
      memo[0].push(_date);
      memo[1].push(null);
    }

    return memo;
  }, [[], []]);
}