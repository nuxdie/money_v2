// src/components/UplotChart.tsx
import UplotReact from 'uplot-react';
import { Options } from 'uplot';
import 'uplot/dist/uPlot.min.css';

interface UplotChartProps {
  data: [number[], number[]]; // Assuming two series: x-axis (time) and y-axis data
}

export function UplotChart({ data }: UplotChartProps) {
  const options: Options = {
    width: 600, // Consider making these responsive or props
    height: 200, // Consider making these responsive or props
    // cursor: {
    //   points: {
    //     stroke: 'var(--primary-accent2)', // Example for cursor points
    //   },
    // },
    axes: [
      {
        // @ts-ignore uPlot types might not directly list CSS vars, but they often work
        stroke: 'var(--secondary-color1)', // For axis lines
        grid: {
          stroke: 'var(--secondary-color1)', // For grid lines
          width: 1 / devicePixelRatio,
        },
        ticks: {
          stroke: 'var(--secondary-color1)', // For tick marks
          width: 1 / devicePixelRatio,
        },
        // @ts-ignore
        font: '12px Inter, sans-serif', // Ensure text uses a consistent font
        // @ts-ignore
        fillStyle: 'var(--text-theme-text)', // For axis labels/numbers
      },
      {
        // @ts-ignore
        stroke: 'var(--secondary-color1)',
        grid: {
          stroke: 'var(--secondary-color1)',
          width: 1 / devicePixelRatio,
        },
        ticks: {
          stroke: 'var(--secondary-color1)',
          width: 1 / devicePixelRatio,
        },
        // @ts-ignore
        font: '12px Inter, sans-serif',
        // @ts-ignore
        fillStyle: 'var(--text-theme-text)',
      },
    ],
    series: [
      {}, // Placeholder for x-axis (time) series configuration if needed
      {
        // @ts-ignore
        stroke: 'var(--primary-accent1)', // Main series line color
        fill: 'rgba(var(--rgb-primary-accent1), 0.1)', // Fill color with opacity
        // points: { // Optional: style points on the line
        //   show: true,
        //   fill: 'var(--primary-accent2)',
        //   stroke: 'var(--primary-accent3)',
        // },
      },
    ],
    // scales: { // Example for scale text styling, if needed and supported
    //   x: {
    //     time: true,
    //     // @ts-ignore
    //     font: '12px Inter, sans-serif',
    //     fillStyle: 'var(--text-theme-text)',
    //   },
    //   y: {
    //     // @ts-ignore
    //     font: '12px Inter, sans-serif',
    //     fillStyle: 'var(--text-theme-text)',
    //   },
    // },
    // legend: { // Example for legend styling
    //   // @ts-ignore
    //   font: '12px Inter, sans-serif',
    //   fillStyle: 'var(--text-theme-text)',
    // }
  };

  // Note: uPlot tooltips are typically DOM elements styled via CSS.
  // Ensure your global CSS or component-specific CSS handles tooltip theming.
  // e.g., .u-tooltip { background-color: var(--theme-card); color: var(--theme-text); }

  return (
    <div className="bg-theme-card text-theme-text p-4 rounded-lg shadow-cyber-shadow">
      <UplotReact options={options} data={data} />
    </div>
  );
}