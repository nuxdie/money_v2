// src/components/NetWorthGraph.tsx
import { useEffect, useRef, useCallback } from 'react';
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

  const loadChartData = useCallback(async () => {
    if (db && chartRef.current) {
      const data = await db.select().from(schema.financialData).orderBy(schema.financialData.date);
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
    </div>
  );
}