// src/components/UplotChart.tsx
import React from 'react';
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';

interface UplotChartProps {
  data: number[][];
}

export function UplotChart({ data }: UplotChartProps) {
  const options = {
    width: 600,
    height: 200,
    series: [
      {},
      {
        stroke: "steelblue",
        fill: "rgba(0,0,255,0.1)",
      }
    ],
  };

  return <UplotReact options={options} data={data} />;
}