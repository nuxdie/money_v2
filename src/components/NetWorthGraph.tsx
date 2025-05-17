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
            colors: ['var(--primary-accent1)', 'var(--primary-accent2)'],
            // Ensure labels and title use theme text colors
            // This might require Dygraphs options for label/title styling if available,
            // or manual DOM manipulation post-render if not.
            // For now, we'll rely on parent container styles for text if possible.
            // Dygraphs doesn't directly support CSS variables for all text elements easily.
            // We will style the container and title, and assume Dygraphs inherits some text styling.
            // `axisLabelColor` was a typo, Dygraphs uses `axisLineColor` for the axis line,
            // and label color is often inherited or controlled by other means.
            // We'll set axisLineColor and rely on global styles for text or accept limitations.
            axisLineColor: 'var(--theme-secondary-1)', // Color for the axis lines themselves
            title: 'Net Worth Over Time', // Title is set here for Dygraphs
            // titleTextStyle: { color: 'var(--theme-text)' }, // Removed as it's not a standard/reliable option
            axisLabelFontSize: 12, // Keep font size adjustments
            axisLabelWidth: 60, // Corrected from yAxisLabelWidth
            xLabelHeight: 18,
            rightGap: 15,
            gridLineColor: 'var(--theme-secondary-1)',
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
    <div className="bg-theme-card shadow-lg rounded-lg p-6 transition-all hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-theme-text">Net Worth Over Time</h2>
      <div ref={chartRef} className="w-full h-[400px] text-theme-text"></div>
    </div>
  );
}