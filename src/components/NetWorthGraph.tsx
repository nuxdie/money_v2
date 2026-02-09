// src/components/NetWorthGraph.tsx
import { useEffect, useRef, useCallback, useState } from 'react';
import { SQLJsDatabase } from 'drizzle-orm/sql-js';
import * as schema from '../schema';
import Dygraph from 'dygraphs';

interface NetWorthGraphProps {
  db: SQLJsDatabase<typeof schema>;
  dataVersion: number;
}

export function NetWorthGraph({ db, dataVersion }: NetWorthGraphProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Dygraph | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState<{ date: string; income: number | null; worth: number | null }[]>([]);

  const loadChartData = useCallback(async () => {
    if (db && chartRef.current) {
      const data = await db.select().from(schema.financialData).orderBy(schema.financialData.date);
      setTableData(data.map(row => ({ date: row.date!, income: row.income, worth: row.worth })));
      const chartData = data.map(row => [
        new Date(row.date!),
        row.income,
        row.worth
      ]);

      if (graphRef.current) {
        graphRef.current.updateOptions({ file: chartData });
      } else {
        graphRef.current = new Dygraph(
          chartRef.current,
          chartData,
          {
            labels: ['Date', 'Income', 'Worth'],
            series: {
              'Income': {
                axis: 'y2'
              },
              'Worth': {
                axis: 'y2'
              },
            },
            axes: {
              y: {
                independentTicks: false
              },
              y2: {
                labelsKMB: true,
                independentTicks: true
              }
            },
            fillGraph: true,
            height: 400,
            titleHeight: 32,
            colors: ['#4CAF50', '#2196F3'],
            strokeWidth: 2,
            legend: 'always',
          }
        );
      }
    }
  }, [db]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData, dataVersion]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 transition-all hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Net Worth Over Time</h2>
      <div ref={chartRef} className="w-full h-[400px]"></div>
      <button
        onClick={() => setShowTable(!showTable)}
        className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {showTable ? 'Hide data' : 'Show data'}
      </button>
      {showTable && (
        <pre className="mt-2 text-xs text-gray-500 font-mono whitespace-pre overflow-x-auto">
{`Date        Income    Worth\n` + tableData.map(row =>
  `${row.date}  ${row.income != null ? String(row.income).padStart(8) : '       —'}  ${row.worth != null ? String(row.worth).padStart(8) : '       —'}`
).join('\n')}
        </pre>
      )}
    </div>
  );
}